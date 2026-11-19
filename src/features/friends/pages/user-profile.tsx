import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'

import Button from '@/components/ui/button'
import Link from '@/components/ui/link'

import Avatar from '@/features/profile/components/avatar'

import { useAuth } from '@/features/auth/lib/auth-context'
import {
	useFriendships,
	type FriendProfile,
} from '@/features/friends/lib/friendships-context'

import { supabase } from '@/lib/supabase'

type Lookup = { username: string; profile: FriendProfile | null }

export default function UserProfilePage() {
	const { username = '' } = useParams()
	const { user } = useAuth()
	const {
		loading: friendshipsLoading,
		getRelation,
		sendRequest,
		acceptRequest,
		removeFriendship,
	} = useFriendships()

	const [lookup, setLookup] = useState<Lookup>()
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		let cancelled = false

		supabase
			.from('profiles')
			.select('id, username, display_name, avatar_path')
			.ilike('username', username.replace(/[\\%_]/g, '\\$&'))
			.maybeSingle()
			.then(({ data }) => {
				if (!cancelled) {
					setLookup({
						username,
						profile: (data as FriendProfile | null) ?? null,
					})
				}
			})

		return () => {
			cancelled = true
		}
	}, [username])

	if (lookup?.username !== username || friendshipsLoading) return null

	const { profile } = lookup

	if (!profile) {
		return (
			<div className="mx-auto flex max-w-sm flex-col items-center gap-4 pt-10">
				<p className="text-mist">Utilisateur introuvable.</p>
				<Link to="/friends">Retour aux amis</Link>
			</div>
		)
	}

	if (profile.id === user?.id) return <Navigate to="/profile" replace />

	const relation = getRelation(profile.id)

	const run = async (action: () => Promise<{ error: unknown }>) => {
		setError(undefined)
		setBusy(true)

		const { error } = await action()
		if (error) setError('Une erreur est survenue, réessaie')

		setBusy(false)
	}

	const handleRemove = (friendshipId: string) => {
		if (!window.confirm(`Supprimer ${profile.display_name} de tes amis ?`))
			return
		run(() => removeFriendship(friendshipId))
	}

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-8">
			<Link
				to="/friends"
				variant="muted"
				className="flex items-center gap-1 self-start"
			>
				<ChevronLeft size={16} />
				Amis
			</Link>

			<header className="flex flex-col items-center gap-1">
				<Avatar
					path={profile.avatar_path}
					name={profile.display_name}
					className="mb-3 size-28 text-4xl"
				/>

				<h1 className="text-2xl font-semibold">{profile.display_name}</h1>
				<p className="text-mist">@{profile.username}</p>
			</header>

			<section className="flex flex-col gap-2.5">
				{relation.status === 'none' && (
					<Button
						disabled={busy}
						onClick={() => run(() => sendRequest(profile.id))}
					>
						Ajouter en ami
					</Button>
				)}

				{relation.status === 'sent' && (
					<>
						<p className="text-mist text-center text-sm">Demande envoyée</p>
						<Button
							variant="secondary"
							disabled={busy}
							onClick={() => run(() => removeFriendship(relation.friendshipId))}
						>
							Annuler la demande
						</Button>
					</>
				)}

				{relation.status === 'received' && (
					<>
						<p className="text-mist text-center text-sm">
							{profile.display_name} souhaite devenir ton ami
						</p>
						<div className="grid grid-cols-2 gap-2.5">
							<Button
								disabled={busy}
								onClick={() => run(() => acceptRequest(relation.friendshipId))}
							>
								Accepter
							</Button>
							<Button
								variant="secondary"
								disabled={busy}
								onClick={() =>
									run(() => removeFriendship(relation.friendshipId))
								}
							>
								Refuser
							</Button>
						</div>
					</>
				)}

				{relation.status === 'friends' && (
					<>
						<p className="text-success text-center text-sm">Vous êtes amis</p>
						<Button
							variant="danger"
							disabled={busy}
							onClick={() => handleRemove(relation.friendshipId)}
						>
							Supprimer de mes amis
						</Button>
					</>
				)}

				{error && (
					<p role="alert" className="text-error text-center text-sm">
						{error}
					</p>
				)}
			</section>
		</div>
	)
}
