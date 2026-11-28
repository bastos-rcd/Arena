import ActivityList from '@/features/activities/components/activity-list'
import { useAuth } from '@/features/auth/lib/auth-context'
import CompetitionCard from '@/features/competitions/components/competition-card'
import { useCompetitions } from '@/features/competitions/lib/use-competitions'
import Section from '@/features/friends/components/section'
import PalmaresStats from '@/features/ranking/components/palmares-stats'

export default function RankingPage() {
	const { user } = useAuth()
	const { finished, loading } = useCompetitions()

	if (loading || !user) return null

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold">Palmarès</h1>

			<PalmaresStats userId={user.id} />

			<Section title={`Terminées · ${finished.length}`}>
				{finished.length === 0 && (
					<p className="text-mist text-sm">Aucune compétition terminée</p>
				)}

				{finished.map((competition) => (
					<CompetitionCard key={competition.id} competition={competition} />
				))}
			</Section>

			<ActivityList userId={user.id} editable />
		</div>
	)
}
