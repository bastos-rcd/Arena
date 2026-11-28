import type { Competition } from '@/features/competitions/lib/competition'
import { getProgress } from '@/features/competitions/lib/competition-dates'

type CompetitionProgressProps = {
	competition: Competition
}

export default function CompetitionProgress({
	competition,
}: CompetitionProgressProps) {
	const { day, total } = getProgress(competition)

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between text-sm">
				<span className="text-mist">Progression</span>

				<span>
					Jour {day} sur {total}
				</span>
			</div>

			<div className="bg-slate h-2 overflow-hidden rounded-full">
				<div
					className="bg-volt h-full rounded-full"
					style={{ width: `${(day / total) * 100}%` }}
				/>
			</div>
		</div>
	)
}
