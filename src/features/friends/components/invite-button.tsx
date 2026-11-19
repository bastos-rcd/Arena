import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

import Button from '@/components/ui/button'

import { shareInvite } from '@/features/friends/lib/invite'
import { useProfile } from '@/features/profile/lib/use-profile'

export default function InviteButton() {
	const { profile } = useProfile()
	const [copied, setCopied] = useState(false)

	if (!profile) return null

	const handleClick = async () => {
		const result = await shareInvite(profile.username)
		if (result !== 'copied') return

		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<Button
			variant="secondary"
			size="sm"
			onClick={handleClick}
			className="flex items-center gap-1.5 px-2.5"
		>
			{copied ? <Check size={16} /> : <Share2 size={16} />}
			{copied ? 'Lien copié' : 'Inviter'}
		</Button>
	)
}
