import { useState } from 'react'

import { getAvatarUrl } from '@/features/profile/lib/avatar'

type AvatarProps = {
	path?: string | null
	name: string
	className?: string
}

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => Array.from(word)[0].toUpperCase())
		.join('')
}

export default function Avatar({
	path,
	name,
	className = 'size-10 text-sm',
}: AvatarProps) {
	const [failedPath, setFailedPath] = useState<string | null>(null)
	const showImage = path && path !== failedPath

	return (
		<span
			className={`bg-slate text-snow inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none ${className}`}
		>
			{showImage ? (
				<img
					src={getAvatarUrl(path)}
					alt=""
					onError={() => setFailedPath(path)}
					className="size-full object-cover"
				/>
			) : (
				getInitials(name)
			)}
		</span>
	)
}
