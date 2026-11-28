import { X } from 'lucide-react'

import Button from '@/components/ui/button'

import UserCard from '@/features/friends/components/user-card'
import { useAction } from '@/features/friends/lib/use-action'
import type { Profile } from '@/features/profile/lib/use-profile'

type ParticipantCardProps = {
	profile: Profile
	isOrganizer: boolean
	canRemove: boolean
	onRemove: (userId: string) => Promise<{ error: unknown }>
}

export default function ParticipantCard({
	profile,
	isOrganizer,
	canRemove,
	onRemove,
}: ParticipantCardProps) {
	const removing = useAction()

	const handleRemove = () => {
		if (!window.confirm(`Retirer ${profile.full_name} de la compétition ?`))
			return

		removing.run(() => onRemove(profile.id))
	}

	return (
		<UserCard profile={profile}>
			{isOrganizer && (
				<span className="text-volt text-sm font-medium">Organisateur</span>
			)}

			{canRemove && !isOrganizer && (
				<Button
					variant="secondary"
					aria-label="Retirer de la compétition"
					loading={removing.loading}
					onClick={handleRemove}
				>
					<X size={20} />
				</Button>
			)}
		</UserCard>
	)
}
