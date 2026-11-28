import { Check, UserMinus, X } from 'lucide-react'

import Button from '@/components/ui/button'

import UserCard from '@/features/friends/components/user-card'
import { useAction } from '@/features/friends/lib/use-action'
import type {
	FriendshipActions,
	Relation,
} from '@/features/friends/lib/use-friendships'

const REMOVE_LABELS: Record<Relation['kind'], string> = {
	friend: 'Retirer des amis',
	sent: 'Annuler la demande',
	received: 'Refuser la demande',
}

type RelationCardProps = {
	relation: Relation
	actions: FriendshipActions
}

export default function RelationCard({ relation, actions }: RelationCardProps) {
	const { id, kind, profile } = relation

	const accepting = useAction()
	const removing = useAction()

	const busy = accepting.loading || removing.loading

	const handleRemove = () => {
		if (
			kind === 'friend' &&
			!window.confirm(`Retirer ${profile.full_name} de tes amis ?`)
		)
			return

		removing.run(() => actions.remove(id))
	}

	return (
		<UserCard profile={profile}>
			{kind === 'received' && (
				<Button
					aria-label="Accepter la demande"
					loading={accepting.loading}
					disabled={busy}
					onClick={() => accepting.run(() => actions.accept(id))}
				>
					<Check size={20} />
				</Button>
			)}

			<Button
				variant="secondary"
				aria-label={REMOVE_LABELS[kind]}
				loading={removing.loading}
				disabled={busy}
				onClick={handleRemove}
			>
				{kind === 'friend' ? <UserMinus size={20} /> : <X size={20} />}
			</Button>
		</UserCard>
	)
}
