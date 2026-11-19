import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
	variant?: 'primary' | 'secondary' | 'danger'
	size?: 'md' | 'sm'
}

const VARIANTS = {
	primary:
		'bg-volt text-ink font-semibold transition-transform active:scale-[0.98]',
	secondary:
		'border-slate border font-medium transition-opacity active:opacity-60',
	danger:
		'border-error text-error border font-medium transition-opacity active:opacity-60',
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
