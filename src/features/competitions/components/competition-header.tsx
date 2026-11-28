import type { Competition } from '@/features/competitions/lib/competition'
import { SPORTS, TYPES } from '@/features/competitions/lib/competition-config'
import {
	formatDate,
	getStatus,
	getStatusLabel,
} from '@/features/competitions/lib/competition-dates'

type CompetitionHeaderProps = {
	competition: Competition
}

export default function CompetitionHeader({
	competition,
}: CompetitionHeaderProps) {
	const { icon: Icon, label: sportLabel } = SPORTS[competition.sport]
	const type = TYPES[competition.type]
	const ongoing = getStatus(competition) === 'ongoing'

	return (
		<header className="flex flex-col gap-4">
			<div className="flex items-center gap-2.5">
				<span className="bg-slate flex size-14 shrink-0 items-center justify-center rounded-full">
					<Icon size={28} />
				</span>

				<div className="flex min-w-0 flex-col">
					<h1 className="text-2xl font-semibold wrap-break-word">
						{competition.name}
					</h1>
					<p className="text-mist">{sportLabel}</p>
				</div>
			</div>

			{competition.description && (
				<p className="text-mist whitespace-pre-line">
					{competition.description}
				</p>
			)}

			<div className="bg-graphite border-slate flex flex-col gap-1 rounded-xl border p-2.5">
				<p className="font-medium">{type.label}</p>
				<p className="text-mist text-sm">{type.description}</p>

				{competition.target_distance !== null && (
					<p className="text-sm">
						Distance de référence : {competition.target_distance} km
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-sm">
					Du {formatDate(competition.start_date)} au{' '}
					{formatDate(competition.end_date)}
				</p>

				<p
					className={`text-sm font-medium ${
						ongoing ? 'text-volt' : 'text-mist'
					}`}
				>
					{getStatusLabel(competition)}
				</p>
			</div>
		</header>
	)
}
