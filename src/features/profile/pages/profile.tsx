import { Camera } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'

import Avatar from '@/components/avatar'
import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import { useAuth } from '@/features/auth/lib/auth-context'
import NameForm from '@/features/profile/components/name-form'
import { useProfile } from '@/features/profile/lib/use-profile'

import { removeAvatars, uploadAvatar } from '@/lib/avatar'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
	const { user } = useAuth()
	const { profile, loading, updateProfile } = useProfile()

	const [uploading, setUploading] = useState<boolean>(false)
	const [deleting, setDeleting] = useState<boolean>(false)

	if (loading) return null

	if (!profile) {
		return (
			<p className="text-mist p-4 text-center">
				Impossible de charger ton profil.
			</p>
		)
	}

	const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		event.currentTarget.value = ''
		if (!file) return

		setUploading(true)

		try {
			const url = await uploadAvatar(profile.id, file)
			const { error } = await updateProfile({ avatar_url: url })
			if (error) throw error

			await removeAvatars(profile.id, url)
		} catch {
			alert("Impossible d'envoyer la photo, réessayer")
		} finally {
			setUploading(false)
		}
	}

	const handleAvatarRemove = async () => {
		if (!window.confirm('Es-tu sûr de vouloir supprimer ta photo ?')) return

		setUploading(true)

		const { error } = await updateProfile({ avatar_url: null })

		if (error) {
			alert('Impossible de supprimer la photo, réessayer')
		} else {
			await removeAvatars(profile.id)
		}

		setUploading(false)
	}

	const handleSignOut = () => {
		if (!window.confirm('Es-tu sûr de vouloir te déconnecter ?')) return
		supabase.auth.signOut()
	}

	const handleDeleteAccount = async () => {
		if (!user) return

		const confirmed = window.confirm(
			'Supprimer définitivement ton compte ? Cette action est irréversible.',
		)
		if (!confirmed) return

		setDeleting(true)

		try {
			await removeAvatars(user.id)

			const { error } = await supabase.rpc('delete_account')
			if (error) throw error

			await supabase.auth.signOut({ scope: 'local' })
		} catch {
			alert('Impossible de supprimer ton compte, réessaie')
			setDeleting(false)
		}
	}

	return (
		<div className="relative mx-auto flex flex-col gap-4">
			<header className="flex flex-col items-center gap-1">
				<label
					aria-busy={uploading}
					className={`relative cursor-pointer ${uploading ? 'opacity-50' : ''}`}
				>
					<Avatar url={profile.avatar_url} className="size-28" />

					<span className="bg-volt text-ink border-ink absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-4">
						<Camera size={16} />
					</span>

					<input
						type="file"
						accept="image/*"
						onChange={handleAvatarChange}
						disabled={uploading}
						className="sr-only"
					/>
				</label>

				<h1 className="mt-2 text-2xl font-semibold">{profile.full_name}</h1>
				<p className="text-mist">@{profile.username}</p>

				{profile.avatar_url && (
					<button
						type="button"
						onClick={handleAvatarRemove}
						disabled={uploading}
						className="text-error mt-1 text-sm underline disabled:opacity-50"
					>
						Supprimer la photo
					</button>
				)}
			</header>

			<NameForm profile={profile} onSave={updateProfile} />

			<Field
				label="Email"
				name="email"
				defaultValue={user?.email}
				disabled={true}
			/>

			<Button variant="danger" disabled={deleting} onClick={handleSignOut}>
				Se déconnecter
			</Button>

			<Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
				Supprimer mon compte
			</Button>
		</div>
	)
}
