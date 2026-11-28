import Link from '@/components/ui/link'

import { useAuth } from '@/features/auth/lib/auth-context'
import CompetitionCard from '@/features/competitions/components/competition-card'
import { useCompetitions } from '@/features/competitions/lib/use-competitions'
import Section from '@/features/friends/components/section'
import HomeStats from '@/features/home/components/home-stats'
import OngoingCard from '@/features/home/components/ongoing-card'
import SportBreakdown from '@/features/home/components/sport-breakdown'
import { summarizeStanding } from '@/features/home/lib/standing-summary'
import { useDashboard } from '@/features/home/lib/use-dashboard'

export default function HomePage() {
	const { user } = useAuth()
	const { ongoing, upcoming, loading } = useCompetitions()

	const {
		standings,
		weekCount,
		loading: dashboardLoading,
	} = useDashboard(
		ongoing.map(({ id }) => id),
		user?.id ?? '',
	)

	if (loading || dashboardLoading || !user) return null

	const summaries = new Map(
		ongoing.map((competition) => [
			competition.id,
			summarizeStanding(
				competition.type,
				standings.get(competition.id) ?? [],
				user.id,
			),
		]),
	)

	const leading = ongoing.filter(
		(competition) =>
			competition.participant_count > 1 &&
			summaries.get(competition.id)?.rank === 1,
	).length

	return (
		<div className="flex flex-col gap-6">
			{ongoing.length === 0 && upcoming.length === 0 && (
				<div className="flex flex-col items-center gap-2.5">
					<p className="text-mist text-sm">
						Aucune compétition en cours ou à venir
					</p>

					<Link to="/create">Créer une compétition</Link>
				</div>
			)}

			{(ongoing.length > 0 || upcoming.length > 0) && (
				<HomeStats
					ongoing={ongoing.length}
					upcoming={upcoming.length}
					leading={leading}
					weekCount={weekCount}
				/>
			)}

			{ongoing.length > 0 && (
				<Section title={`En cours · ${ongoing.length}`}>
					{ongoing.map((competition) => {
						const summary = summaries.get(competition.id)

						return (
							summary && (
								<OngoingCard
									key={competition.id}
									competition={competition}
									summary={summary}
								/>
							)
						)
					})}
				</Section>
			)}

			{upcoming.length > 0 && (
				<Section title={`À venir · ${upcoming.length}`}>
					{upcoming.map((competition) => (
						<CompetitionCard key={competition.id} competition={competition} />
					))}
				</Section>
			)}

			{(ongoing.length > 0 || upcoming.length > 0) && (
				<SportBreakdown competitions={[...ongoing, ...upcoming]} />
			)}
		</div>
	)
}
