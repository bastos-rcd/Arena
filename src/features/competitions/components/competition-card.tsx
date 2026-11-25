import Link from '@/components/ui/link'

import { SPORTS, TYPES } from '@/features/competitions/lib/competition-config'
import {
	getStatus,
	getStatusLabel,
} from '@/features/competitions/lib/competition-dates'
import type { CompetitionSummary } from '@/features/competitions/lib/use-competitions'

type CompetitionCardProps = {
	competition: CompetitionSummary
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
	const { icon: Icon } = SPORTS[competition.sport]
	const ongoing = getStatus(competition) === 'ongoing'

	return (
		<Link
			to={`/competitions/${competition.id}`}
			variant="plain"
			className="bg-graphite border-slate flex items-center gap-2.5 rounded-xl border p-2.5"
		>
			<span className="bg-slate flex size-10 shrink-0 items-center justify-center rounded-full">
				<Icon size={20} />
			</span>

			<span className="flex min-w-0 flex-col">
				<span className="truncate font-medium">{competition.name}</span>

				<span className="text-mist truncate text-sm">
					{TYPES[competition.type].label} · {competition.participant_count}{' '}
					{competition.participant_count > 1 ? 'participants' : 'participant'}
				</span>

				<span
					className={`truncate text-sm font-medium ${
						ongoing ? 'text-volt' : 'text-mist'
					}`}
				>
					{getStatusLabel(competition)}
				</span>
			</span>
		</Link>
	)
}
