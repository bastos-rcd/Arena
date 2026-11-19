import { useId, type ComponentProps } from 'react'

type FieldProps = ComponentProps<'input'> & {
	label: string
	error?: string
}

export default function Field({ label, error, id, ...props }: FieldProps) {
	const generatedId = useId()
	const inputId = id ?? generatedId
	const errorId = `${inputId}-error`

	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={inputId} className="text-mist text-sm font-medium">
				{label}
			</label>

			<input
				{...props}
				id={inputId}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? errorId : undefined}
				className={`bg-graphite text-snow rounded-xl border p-2.5 outline-none ${
					error ? 'border-error' : 'border-slate'
				}`}
			/>

			{error && (
				<p id={errorId} className="text-error text-sm">
					{error}
				</p>
			)}
		</div>
	)
}
