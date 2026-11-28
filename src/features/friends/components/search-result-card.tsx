import { UserPlus } from 'lucide-react'

import Button from '@/components/ui/button'

import UserCard from '@/features/friends/components/user-card'
import { useAction } from '@/features/friends/lib/use-action'
import type {
	FriendshipActions,
	Relation,
} from '@/features/friends/lib/use-friendships'
import type { Profile } from '@/features/profile/lib/use-profile'

const STATUS_LABELS: Record<Relation['kind'], string> = {
	friend: 'Ami',
	sent: 'Demande envoyée',
	received: 'Demande reçue',
}

type SearchResultCardProps = {
	profile: Profile
	relation?: Relation
	actions: FriendshipActions
}

export default function SearchResultCard({
	profile,
	relation,
	actions,
}: SearchResultCardProps) {
	const sending = useAction()

	return (
		<UserCard profile={profile}>
			{relation ? (
				<span
					className={`text-sm font-medium ${
						relation.kind === 'friend' ? 'text-volt' : 'text-mist'
					}`}
				>
					{STATUS_LABELS[relation.kind]}
				</span>
			) : (
				<Button
					aria-label="Ajouter en ami"
					loading={sending.loading}
					onClick={() => sending.run(() => actions.send(profile.id))}
				>
					<UserPlus size={20} />
				</Button>
			)}
		</UserCard>
	)
}
