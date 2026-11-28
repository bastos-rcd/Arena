import type { ComponentProps } from 'react'

type SelectProps = ComponentProps<'select'> & {
	label: string
	error?: string
}

export default function Select({
	label,
	error,
	className,
	children,
	...props
}: SelectProps) {
	return (
		<label className="flex w-full flex-col gap-1.5">
			<span className="text-mist text-sm font-medium">{label}</span>

			<select
				{...props}
				aria-invalid={error ? true : undefined}
				className={`bg-graphite text-snow rounded-xl border p-2.5 outline-none disabled:opacity-50 ${
					error ? 'border-error' : 'border-slate'
				} ${className ?? ''}`}
			>
				{children}
			</select>

			{error && <span className="text-error text-sm">{error}</span>}
		</label>
	)
}
