import CompetitionCard from '@/features/competitions/components/competition-card'
import { useCompetitions } from '@/features/competitions/lib/use-competitions'
import Section from '@/features/friends/components/section'

export default function RankingPage() {
	const { finished, loading } = useCompetitions()

	if (loading) return null

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold">Palmarès</h1>

			<Section title={`Terminées · ${finished.length}`}>
				{finished.length === 0 && (
					<p className="text-mist text-sm">Aucune compétition terminée</p>
				)}

				{finished.map((competition) => (
					<CompetitionCard key={competition.id} competition={competition} />
				))}
			</Section>
		</div>
	)
}
