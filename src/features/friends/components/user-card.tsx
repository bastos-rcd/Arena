import type { ReactNode } from 'react'

import Avatar from '@/components/avatar'
import Link from '@/components/ui/link'

import type { Profile } from '@/features/profile/lib/use-profile'

type UserCardProps = {
	profile: Profile
	children?: ReactNode
}

export default function UserCard({ profile, children }: UserCardProps) {
	return (
		<div className="bg-graphite border-slate flex items-center gap-2.5 rounded-xl border p-2.5">
			<Link
				to={`/u/${profile.username}`}
				variant="plain"
				className="flex min-w-0 flex-1 items-center gap-2.5"
			>
				<Avatar url={profile.avatar_url} />

				<span className="flex min-w-0 flex-col">
					<span className="truncate font-medium">{profile.full_name}</span>
					<span className="text-mist truncate text-sm">
						@{profile.username}
					</span>
				</span>
			</Link>

			{children}
		</div>
	)
}
