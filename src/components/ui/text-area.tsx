import type { ComponentProps } from 'react'

type TextAreaProps = ComponentProps<'textarea'> & {
	label: string
	error?: string
}

export default function TextArea({
	label,
	error,
	className,
	...props
}: TextAreaProps) {
	return (
		<label className="flex w-full flex-col gap-1.5">
			<span className="text-mist text-sm font-medium">{label}</span>

			<textarea
				{...props}
				aria-invalid={error ? true : undefined}
				className={`bg-graphite text-snow resize-none rounded-xl border p-2.5 outline-none ${
					error ? 'border-error' : 'border-slate'
				} ${className ?? ''}`}
			/>

			{error && <span className="text-error text-sm">{error}</span>}
		</label>
	)
}
