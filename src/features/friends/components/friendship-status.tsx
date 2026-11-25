import { useState } from 'react'

import Button from '@/components/ui/button'

import type {
	FriendshipActions,
	Relation,
} from '@/features/friends/lib/use-friendships'
import type { Profile } from '@/features/profile/lib/use-profile'

type Key = 'send' | 'accept' | 'remove'

type FriendshipStatusProps = {
	profile: Profile
	relation?: Relation
	actions: FriendshipActions
}

export default function FriendshipStatus({
	profile,
	relation,
	actions,
}: FriendshipStatusProps) {
	const [busy, setBusy] = useState<Key | null>(null)
	const [error, setError] = useState<string>()

	const run = async (key: Key, action: () => Promise<{ error: unknown }>) => {
		setBusy(key)
		setError(undefined)

		const { error } = await action()

		if (error) setError('Une erreur est survenue, réessayer')

		setBusy(null)
	}

	const handleRemove = (id: string) => {
		if (!window.confirm(`Retirer ${profile.full_name} de tes amis ?`)) return

		run('remove', () => actions.remove(id))
	}

	return (
		<section className="flex flex-col gap-2.5">
			{!relation && (
				<Button
					loading={busy === 'send'}
					disabled={busy !== null}
					onClick={() => run('send', () => actions.send(profile.id))}
				>
					Ajouter en ami
				</Button>
			)}

			{relation?.kind === 'sent' && (
				<Button
					variant="secondary"
					loading={busy === 'remove'}
					disabled={busy !== null}
					onClick={() => run('remove', () => actions.remove(relation.id))}
				>
					Annuler la demande
				</Button>
			)}

			{relation?.kind === 'received' && (
				<div className="grid grid-cols-2 gap-2.5">
					<Button
						loading={busy === 'accept'}
						disabled={busy !== null}
						onClick={() => run('accept', () => actions.accept(relation.id))}
					>
						Accepter
					</Button>

					<Button
						variant="secondary"
						loading={busy === 'remove'}
						disabled={busy !== null}
						onClick={() => run('remove', () => actions.remove(relation.id))}
					>
						Refuser
					</Button>
				</div>
			)}

			{relation?.kind === 'friend' && (
				<Button
					variant="danger"
					loading={busy === 'remove'}
					disabled={busy !== null}
					onClick={() => handleRemove(relation.id)}
				>
					Retirer des amis
				</Button>
			)}

			{error && (
				<p role="alert" className="text-error text-center text-sm">
					{error}
				</p>
			)}
		</section>
	)
}
