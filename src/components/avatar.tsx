import { User } from 'lucide-react'
import { useState } from 'react'

import { getAvatarUrl } from '@/lib/avatar'

type AvatarProps = {
	url?: string | null
	className?: string
}

export default function Avatar({ url, className = 'size-10' }: AvatarProps) {
	const [failedUrl, setFailedUrl] = useState<string | null>(null)
	const showImage = url && url !== failedUrl

	return (
		<span
			className={`bg-slate text-snow inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none ${className}`}
		>
			{showImage ? (
				<img
					src={getAvatarUrl(url)}
					onError={() => setFailedUrl(url)}
					className="size-full object-cover"
				/>
			) : (
				<User className="size-1/2" />
			)}
		</span>
	)
}
