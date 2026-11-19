import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import type { Profile, useProfile } from '@/features/profile/lib/use-profile'

import { validateDisplayName } from '@/lib/validation'

type ChangeNameProps = {
	profile: Profile
	onSave: ReturnType<typeof useProfile>['updateProfile']
}

export default function ChangeName({ profile, onSave }: ChangeNameProps) {
	const [error, setError] = useState<string>()
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()

		const displayName = String(
			new FormData(event.currentTarget).get('displayName'),
		).trim()

		const validationError = validateDisplayName(displayName)
		setSaved(false)
		setError(validationError)

		if (validationError || displayName === profile.display_name) return

		setSaving(true)
		const { error } = await onSave({ display_name: displayName })

		if (error) setError('Impossible d’enregistrer, réessaie')
		else setSaved(true)

		setSaving(false)
	}

	return (
		<form
			key={profile.display_name}
			onSubmit={handleSubmit}
			noValidate
			className="flex flex-col gap-4"
		>
			<Field
				label="Nom affiché"
				name="displayName"
				defaultValue={profile.display_name}
				autoComplete="name"
				maxLength={40}
				error={error}
				onChange={() => setSaved(false)}
			/>

			<Button type="submit" disabled={saving}>
				{saving ? 'Enregistrement…' : 'Enregistrer'}
			</Button>

			{saved && (
				<p role="status" className="text-success text-center text-sm">
					Nom enregistré
				</p>
			)}
		</form>
	)
}
