import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'

const VARIANTS = {
	primary:
		'bg-volt text-ink font-semibold transition-transform active:scale-95',
	secondary:
		'border border-slate font-medium transition-opacity active:opacity-50',
	danger:
		'border border-error text-error font-medium transition-opacity active:opacity-50',
}

type ButtonProps = ComponentProps<'button'> & {
	variant?: 'primary' | 'secondary' | 'danger'
	loading?: boolean
}

export default function Button({
	variant = 'primary',
	loading,
	disabled,
	children,
	type = 'button',
	className = '',
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			type={type}
			disabled={disabled || loading}
			className={`${VARIANTS[variant]} flex items-center justify-center rounded-xl p-2.5 disabled:opacity-50 ${className}`}
		>
			{loading ? <LoaderCircle size={24} className="animate-spin" /> : children}
		</button>
	)
}
