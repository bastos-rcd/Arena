import type { ReactNode } from 'react'

import Link from '@/components/ui/link'

import Avatar from '@/features/profile/components/avatar'

import type { FriendProfile } from '@/features/friends/lib/friendships-context'

type UserRowProps = {
	profile: FriendProfile
	children?: ReactNode
}

export default function UserRow({ profile, children }: UserRowProps) {
	return (
		<li className="bg-graphite border-slate flex items-center gap-2.5 rounded-xl border p-2.5">
			<Link
				to={`/u/${profile.username}`}
				variant="plain"
				className="flex min-w-0 flex-1 items-center gap-2.5"
			>
				<Avatar path={profile.avatar_path} name={profile.display_name} />

				<span className="min-w-0">
					<span className="block truncate font-medium">
						{profile.display_name}
					</span>
					<span className="text-mist block truncate text-sm">
						@{profile.username}
					</span>
				</span>
			</Link>

			{children}
		</li>
	)
}
