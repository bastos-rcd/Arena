import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
	variant?: 'primary' | 'secondary' | 'danger'
	size?: 'md' | 'sm'
}

const VARIANTS = {
	primary:
		'bg-volt text-ink font-semibold transition-transform active:scale-95',
	secondary:
		'border border-slate font-medium transition-opacity active:opacity-50',
	danger:
		'border border-error text-error font-medium transition-opacity active:opacity-50',
}

const SIZES = {
	md: 'rounded-xl p-2.5',
	sm: 'rounded-xl p-1.5 text-sm',
}

export default function Button({
	variant = 'primary',
	size = 'md',
	type = 'button',
	className = '',
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={`${VARIANTS[variant]} ${SIZES[size]} disabled:opacity-50 ${className}`}
			{...props}
		/>
	)
}
