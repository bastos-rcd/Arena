import { TYPES } from '@/features/competitions/lib/competition-config'
import type { PalmaresRow } from '@/features/ranking/lib/palmares'

import { formatNumber } from '@/lib/format'

type PalmaresTypeCardProps = {
	row: PalmaresRow
}

export default function PalmaresTypeCard({ row }: PalmaresTypeCardProps) {
	const averageRank = row.ranked > 0 ? row.rank_sum / row.ranked : null

	return (
		<div className="bg-graphite border-slate flex items-center justify-between gap-2.5 rounded-xl border p-2.5">
			<span className="flex min-w-0 flex-col">
				<span className="truncate font-medium">{TYPES[row.type].label}</span>

				<span className="text-mist truncate text-sm">
					{row.played} {row.played > 1 ? 'compétitions' : 'compétition'}
					{averageRank !== null && ` · rang moyen ${formatNumber(averageRank)}`}
				</span>
			</span>

			<span className="shrink-0 text-sm">
				<span className="text-success font-semibold">{row.wins} V</span>
				<span className="text-mist"> · {row.played - row.wins} D</span>
			</span>
		</div>
	)
}
