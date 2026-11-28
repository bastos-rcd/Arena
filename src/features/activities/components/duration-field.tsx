import { splitDuration } from '@/features/activities/lib/activity-duration'

type DurationFieldProps = {
	error?: string
	defaultSeconds?: number
}

const UNITS = [
	{ name: 'hours', unit: 'h' },
	{ name: 'minutes', unit: 'min' },
	{ name: 'seconds', unit: 's' },
] as const

export default function DurationField({
	error,
	defaultSeconds = 0,
}: DurationFieldProps) {
	const parts = splitDuration(defaultSeconds)

	return (
		<fieldset>
			<legend className="text-mist mb-1.5 text-sm font-medium">Durée</legend>

			<div className="grid grid-cols-3 gap-2">
				{UNITS.map(({ name, unit }) => (
					<label key={name} className="relative">
						<input
							name={name}
							type="text"
							inputMode="numeric"
							maxLength={2}
							placeholder="0"
							defaultValue={parts[name] || ''}
							aria-invalid={error ? true : undefined}
							className={`bg-graphite text-snow w-full rounded-xl border p-2.5 pr-10 outline-none ${
								error ? 'border-error' : 'border-slate'
							}`}
						/>

						<span className="text-mist pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
							{unit}
						</span>
					</label>
				))}
			</div>

			{error && (
				<span className="text-error mt-1.5 block text-sm">{error}</span>
			)}
		</fieldset>
	)
}
