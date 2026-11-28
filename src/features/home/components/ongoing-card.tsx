import Link from '@/components/ui/link'

import RankBadge from '@/features/competitions/components/rank-badge'
import { SPORTS, TYPES } from '@/features/competitions/lib/competition-config'
import {
	getProgress,
	getStatusLabel,
} from '@/features/competitions/lib/competition-dates'
import type { CompetitionSummary } from '@/features/competitions/lib/use-competitions'
import {
	formatSummaryScore,
	type StandingSummary,
} from '@/features/home/lib/standing-summary'

type OngoingCardProps = {
	competition: CompetitionSummary
	summary: StandingSummary
}

export default function OngoingCard({
	competition,
	summary,
}: OngoingCardProps) {
	const { icon: Icon } = SPORTS[competition.sport]
	const { day, total } = getProgress(competition)

	return (
		<Link
			to={`/competitions/${competition.id}`}
			variant="plain"
			className="bg-graphite border-slate flex flex-col gap-2.5 rounded-xl border p-2.5"
		>
			<span className="flex items-center gap-2.5">
				<span className="bg-slate flex size-10 shrink-0 items-center justify-center rounded-full">
					<Icon size={20} />
				</span>

				<span className="flex min-w-0 flex-1 flex-col">
					<span className="truncate font-medium">{competition.name}</span>

					<span className="text-mist truncate text-sm">
						{TYPES[competition.type].label} · {competition.participant_count}{' '}
						{competition.participant_count > 1 ? 'participants' : 'participant'}
					</span>
				</span>

				<RankBadge rank={summary.rank} />
			</span>

			<span className="flex flex-col gap-1.5">
				<span className="bg-slate h-1.5 overflow-hidden rounded-full">
					<span
						className="bg-volt block h-full rounded-full"
						style={{ width: `${(day / total) * 100}%` }}
					/>
				</span>

				<span className="text-volt truncate text-sm font-medium">
					{getStatusLabel(competition)}
				</span>
			</span>

			<span className="flex items-baseline justify-between gap-2.5 text-sm">
				<span className="font-semibold">
					{formatSummaryScore(competition.type, summary)}
				</span>

				<span className="text-mist truncate">{summary.message}</span>
			</span>
		</Link>
	)
}
