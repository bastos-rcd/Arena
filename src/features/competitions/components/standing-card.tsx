import Avatar from '@/components/avatar'
import Link from '@/components/ui/link'

import type { CompetitionType } from '@/features/competitions/lib/competition'
import {
	formatGap,
	formatScore,
} from '@/features/competitions/lib/competition-format'
import type { Standing } from '@/features/competitions/lib/use-competition-results'
import type { Profile } from '@/features/profile/lib/use-profile'

const RANK_STYLES: Record<number, string> = {
	1: 'bg-gold text-ink',
	2: 'bg-silver text-ink',
	3: 'bg-bronze text-ink',
}

type StandingCardProps = {
	profile: Profile
	standing: Standing
	type: CompetitionType
	leaderScore: number | null
	isCurrentUser: boolean
}

export default function StandingCard({
	profile,
	standing,
	type,
	leaderScore,
	isCurrentUser,
}: StandingCardProps) {
	const { rank, score, activity_count } = standing

	return (
		<div
			className={`bg-graphite flex items-center gap-2.5 rounded-xl border p-2.5 ${
				isCurrentUser ? 'border-volt' : 'border-slate'
			}`}
		>
			<span
				className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
					RANK_STYLES[rank ?? 0] ?? 'bg-slate text-mist'
				}`}
			>
				{rank ?? '–'}
			</span>

			<Link
				to={`/u/${profile.username}`}
				variant="plain"
				className="flex min-w-0 flex-1 items-center gap-2.5"
			>
				<Avatar url={profile.avatar_url} />

				<span className="flex min-w-0 flex-col">
					<span className="truncate font-medium">{profile.full_name}</span>

					<span className="text-mist truncate text-sm">
						{activity_count === 0
							? 'Aucune activité'
							: `${activity_count} ${activity_count > 1 ? 'activités' : 'activité'}`}
					</span>
				</span>
			</Link>

			{score !== null && (
				<span className="flex shrink-0 flex-col items-end">
					<span className="font-semibold">{formatScore(type, score)}</span>

					{rank !== null && rank > 1 && leaderScore !== null && (
						<span className="text-mist text-sm">
							{formatGap(type, score, leaderScore)}
						</span>
					)}
				</span>
			)}
		</div>
	)
}
