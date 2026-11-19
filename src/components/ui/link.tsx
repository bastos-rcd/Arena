import type { ComponentProps } from 'react'
import { Link as RouterLink } from 'react-router'

type LinkProps = ComponentProps<typeof RouterLink> & {
	variant?: 'accent' | 'muted'
}

const VARIANTS = {
	accent: 'text-volt font-medium transition-opacity active:opacity-50',
	muted: 'text-mist text-sm transition-opacity active:opacity-50',
}

export default function Link({
	variant = 'accent',
	className = '',
	...props
}: LinkProps) {
	return (
		<RouterLink className={`${VARIANTS[variant]} ${className}`} {...props} />
	)
}
