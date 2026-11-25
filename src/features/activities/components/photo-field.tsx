import { Camera } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'

type PhotoFieldProps = {
	label: string
	error?: string
}

export default function PhotoField({ label, error }: PhotoFieldProps) {
	const [preview, setPreview] = useState<string>()

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview)
		}
	}, [preview])

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.currentTarget.files?.[0]

		setPreview(file ? URL.createObjectURL(file) : undefined)
	}

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-mist text-sm font-medium">{label}</span>

			<label
				className={`bg-graphite text-mist relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed ${
					error ? 'border-error' : 'border-slate'
				}`}
			>
				{preview ? (
					<>
						<img src={preview} alt="" className="size-full object-cover" />

						<span className="bg-volt text-ink absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full">
							<Camera size={16} />
						</span>
					</>
				) : (
					<>
						<Camera size={24} />
						<span className="text-sm">Ajouter une photo</span>
					</>
				)}

				<input
					type="file"
					name="photo"
					accept="image/*"
					onChange={handleChange}
					className="sr-only"
				/>
			</label>

			{error && <span className="text-error text-sm">{error}</span>}
		</div>
	)
}
