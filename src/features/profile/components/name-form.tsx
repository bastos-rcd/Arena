import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import { validateFullName } from '@/features/auth/lib/validation'
import type { Profile, useProfile } from '@/features/profile/lib/use-profile'

type NameFormProps = {
	profile: Profile
	onSave: ReturnType<typeof useProfile>['updateProfile']
}

export default function NameForm({ profile, onSave }: NameFormProps) {
	const [fullName, setFullName] = useState<string>(profile.full_name)
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const trimmed = fullName.trim()
		const nextError = validateFullName(trimmed)

		setError(nextError)

		if (nextError || trimmed === profile.full_name) return

		setError(undefined)
		setLoading(true)

		const { error } = await onSave({ full_name: trimmed })

		if (error) setError("Impossible d'enregistrer, réessayer")

		setLoading(false)
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Field
				label="Nom complet"
				error={error}
				name="fullName"
				defaultValue={fullName}
				autoComplete="name"
				onChange={(e) => setFullName(e.target.value)}
			/>

			<Button
				type="submit"
				loading={loading}
				disabled={!fullName.trim() || fullName.trim() === profile.full_name}
			>
				Enregistrer
			</Button>
		</form>
	)
}
