import { Camera, Settings } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'

import Link from '@/components/ui/link'

import Avatar from '@/features/profile/components/avatar'
import ChangeName from '@/features/profile/components/change-name'
import ChangePassword from '@/features/profile/components/change-password'

import { removeAvatars, uploadAvatar } from '@/features/profile/lib/avatar'
import { useProfile } from '@/features/profile/lib/use-profile'

export default function ProfilePage() {
	const { profile, loading, updateProfile } = useProfile()

	const [uploading, setUploading] = useState(false)
	const [avatarError, setAvatarError] = useState<string>()

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

	return (
		<div className="relative mx-auto flex max-w-sm flex-col gap-8">
			<Link
				to="/settings"
				variant="muted"
				aria-label="Réglages"
				className="absolute top-0 right-0 p-1"
			>
				<Settings size={24} />
			</Link>

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

			<ChangeName profile={profile} onSave={updateProfile} />

			<ChangePassword />
		</div>
	)
}
