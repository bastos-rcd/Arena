import Stat from '@/components/ui/stat'

import type { Sport } from '@/features/competitions/lib/competition'
import { SPORTS } from '@/features/competitions/lib/competition-config'
import Section from '@/features/friends/components/section'
import PalmaresTypeCard from '@/features/ranking/components/palmares-type-card'
import { getTotals } from '@/features/ranking/lib/palmares'
import { usePalmares } from '@/features/ranking/lib/use-palmares'

import { formatNumber } from '@/lib/format'

type PalmaresStatsProps = {
	userId: string
}

export default function PalmaresStats({ userId }: PalmaresStatsProps) {
	const { rows, loading } = usePalmares(userId)

	if (loading) return null

	if (rows.length === 0) {
		return (
			<Section title="Statistiques">
				<p className="text-mist text-sm">Aucune compétition terminée</p>
			</Section>
		)
	}

	const totals = getTotals(rows)

	return (
		<>
			<Section title="Statistiques">
				<div className="grid grid-cols-2 gap-2.5">
					<Stat label="Compétitions" value={String(totals.played)} />
					<Stat label="Victoires" value={String(totals.wins)} />
					<Stat label="Défaites" value={String(totals.defeats)} />
					<Stat label="Podiums" value={String(totals.podiums)} />
					<Stat label="Taux de victoire" value={`${totals.winRate} %`} />
					<Stat
						label="Rang moyen"
						value={
							totals.averageRank === null
								? '–'
								: formatNumber(totals.averageRank)
						}
					/>
				</div>
			</Section>

			{(Object.keys(SPORTS) as Sport[]).map((sport) => {
				const sportRows = SPORTS[sport].types.flatMap((type) => {
					const row = rows.find((r) => r.sport === sport && r.type === type)

					return row ? [row] : []
				})

				if (sportRows.length === 0) return null

				return (
					<Section key={sport} title={SPORTS[sport].label}>
						{sportRows.map((row) => (
							<PalmaresTypeCard key={row.type} row={row} />
						))}
					</Section>
				)
			})}
		</>
	)
}
