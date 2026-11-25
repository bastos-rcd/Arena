import { Navigate, useParams } from 'react-router'

import Avatar from '@/components/avatar'
import Return from '@/components/ui/return'

import { useAuth } from '@/features/auth/lib/auth-context'
import FriendshipStatus from '@/features/friends/components/friendship-status'
import { useFriendships } from '@/features/friends/lib/use-friendships'
import { useUserProfile } from '@/features/profile/lib/use-user-profile'

export default function UserProfilePage() {
	const { username = '' } = useParams()
	const { user } = useAuth()

	const { profile, loading } = useUserProfile(username)
	const {
		byProfileId,
		loading: friendshipsLoading,
		send,
		accept,
		remove,
	} = useFriendships()

	if (loading || friendshipsLoading) return null

	if (!profile) {
		return (
			<div className="mx-auto flex max-w-sm flex-col gap-8">
				<Return to="/friends" label="Amis" />

				<p className="text-mist text-center">Utilisateur introuvable</p>
			</div>
		)
	}

	if (profile.id === user?.id) return <Navigate to="/profile" replace />

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-8">
			<Return to="/friends" label="Amis" />

			<header className="flex flex-col items-center gap-1">
				<Avatar url={profile.avatar_url} className="size-28 text-4xl" />

				<h1 className="mt-2 text-2xl font-semibold">{profile.full_name}</h1>
				<p className="text-mist">@{profile.username}</p>
			</header>

			<FriendshipStatus
				profile={profile}
				relation={byProfileId.get(profile.id)}
				actions={{ send, accept, remove }}
			/>
		</div>
	)
}
