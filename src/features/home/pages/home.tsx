import Link from '@/components/ui/link'

import CompetitionCard from '@/features/competitions/components/competition-card'
import { useCompetitions } from '@/features/competitions/lib/use-competitions'
import Section from '@/features/friends/components/section'

export default function HomePage() {
	const { ongoing, upcoming, loading } = useCompetitions()

	if (loading) return null

	return (
		<div className="flex flex-col gap-4">
			{ongoing.length === 0 && upcoming.length === 0 && (
				<div className="flex flex-col items-center gap-2.5">
					<p className="text-mist text-sm">
						Aucune compétition en cours ou à venir
					</p>

					<Link to="/create">Créer une compétition</Link>
				</div>
			)}

			{ongoing.length > 0 && (
				<Section title={`En cours · ${ongoing.length}`}>
					{ongoing.map((competition) => (
						<CompetitionCard key={competition.id} competition={competition} />
					))}
				</Section>
			)}

			{upcoming.length > 0 && (
				<Section title={`À venir · ${upcoming.length}`}>
					{upcoming.map((competition) => (
						<CompetitionCard key={competition.id} competition={competition} />
					))}
				</Section>
			)}
		</div>
	)
}
