import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Camera } from 'lucide-react'

import Avatar from '@/components/avatar'
import Field from '@/components/field'

import { removeAvatars, uploadAvatar } from '@/lib/avatar'
import { useProfile } from '@/lib/use-profile'
import { supabase } from '@/lib/supabase'
import { validateDisplayName } from '@/lib/validation'
import { useAuth } from '@/lib/auth/auth-context'

export default function ProfilePage() {
	const { user } = useAuth()
	const { profile, loading, updateProfile } = useProfile()

	const [uploading, setUploading] = useState(false)
	const [avatarError, setAvatarError] = useState<string>()
	const [nameError, setNameError] = useState<string>()
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	if (loading) return null

	if (!profile) {
		return (
			<p className="text-mist p-6 text-center">
				Impossible de charger ton profil.
			</p>
		)
	}

	const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		event.currentTarget.value = ''
		if (!file) return

		setAvatarError(undefined)
		setUploading(true)

		try {
			const path = await uploadAvatar(profile.id, file)
			const { error } = await updateProfile({ avatar_path: path })
			if (error) throw error

			await removeAvatars(profile.id, path)
		} catch {
			setAvatarError("Impossible d'envoyer la photo, réessaie")
		} finally {
			setUploading(false)
		}
	}

	const handleAvatarRemove = async () => {
		if (!window.confirm('Es-tu sûr de vouloir supprimer ta photo ?')) return

		setAvatarError(undefined)
		setUploading(true)

		const { error } = await updateProfile({ avatar_path: null })

		if (error) {
			setAvatarError('Impossible de supprimer la photo, réessaie')
		} else {
			await removeAvatars(profile.id)
		}

		setUploading(false)
	}

	const handleNameSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()

		const displayName = String(
			new FormData(event.currentTarget).get('displayName'),
		).trim()

		const validationError = validateDisplayName(displayName)
		setSaved(false)
		setNameError(validationError)

		if (validationError || displayName === profile.display_name) return

		setSaving(true)
		const { error } = await updateProfile({ display_name: displayName })

		if (error) setNameError('Impossible d’enregistrer, réessaie')
		else setSaved(true)

		setSaving(false)
	}

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-8">
			<header className="flex flex-col items-center gap-1">
				<label
					aria-busy={uploading}
					className={`relative mb-3 cursor-pointer ${uploading ? 'opacity-50' : ''}`}
				>
					<Avatar
						path={profile.avatar_path}
						name={profile.display_name}
						className="size-28 text-4xl"
					/>

					<span className="bg-volt text-ink border-ink absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-4">
						<Camera size={16} />
					</span>

					<span className="sr-only">Changer la photo de profil</span>
					<input
						type="file"
						accept="image/*"
						onChange={handleAvatarChange}
						disabled={uploading}
						className="sr-only"
					/>
				</label>

				<h1 className="text-2xl font-semibold">{profile.display_name}</h1>
				<p className="text-mist">@{profile.username}</p>

				{profile.avatar_path && (
					<button
						type="button"
						onClick={handleAvatarRemove}
						disabled={uploading}
						className="text-error mt-2 text-sm underline disabled:opacity-50"
					>
						Supprimer la photo
					</button>
				)}

				{avatarError && (
					<p role="alert" className="text-error mt-2 text-sm">
						{avatarError}
					</p>
				)}
			</header>

			<form
				key={profile.display_name}
				onSubmit={handleNameSubmit}
				noValidate
				className="flex flex-col gap-4"
			>
				<Field
					label="Nom affiché"
					name="displayName"
					defaultValue={profile.display_name}
					autoComplete="name"
					maxLength={40}
					error={nameError}
					onChange={() => setSaved(false)}
				/>

				<button
					type="submit"
					disabled={saving}
					className="bg-volt text-ink rounded-xl p-2.5 font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
				>
					{saving ? 'Enregistrement…' : 'Enregistrer'}
				</button>

				{saved && (
					<p role="status" className="text-success text-center text-sm">
						Nom enregistré
					</p>
				)}
			</form>

			<div className="bg-graphite border-slate rounded-xl border p-2.5">
				<p className="text-mist text-sm">Email</p>
				<p className="break-all">{user?.email}</p>
			</div>

			<button
				type="button"
				onClick={() => {
					if (!window.confirm('Es-tu sûr de vouloir te déconnecter ?')) return
					supabase.auth.signOut()
				}}
				className="border-error text-error rounded-xl border p-2.5 font-medium transition-opacity active:opacity-60"
			>
				Se déconnecter
			</button>
		</div>
	)
}
