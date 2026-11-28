import { UserPlus } from 'lucide-react'

import Button from '@/components/ui/button'

import UserCard from '@/features/friends/components/user-card'
import { useAction } from '@/features/friends/lib/use-action'
import type { Profile } from '@/features/profile/lib/use-profile'

type AddParticipantCardProps = {
	profile: Profile
	onAdd: (userId: string) => Promise<{ error: unknown }>
}

export default function AddParticipantCard({
	profile,
	onAdd,
}: AddParticipantCardProps) {
	const adding = useAction()

	return (
		<UserCard profile={profile}>
			<Button
				aria-label="Ajouter à la compétition"
				loading={adding.loading}
				onClick={() => adding.run(() => onAdd(profile.id))}
			>
				<UserPlus size={20} />
			</Button>
		</UserCard>
	)
}
