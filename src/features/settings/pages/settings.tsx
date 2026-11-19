import { ChevronLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import Button from '@/components/ui/button'

import { useAuth } from '@/features/auth/lib/auth-context'
import { removeAvatars } from '@/features/profile/lib/avatar'

import { supabase } from '@/lib/supabase'

type ConnectedApp = {
	id: string
	name: string
}

const connectedApps: ConnectedApp[] = []

export default function SettingsPage() {
	const { user } = useAuth()

	const [deleting, setDeleting] = useState(false)
	const [deleteError, setDeleteError] = useState<string>()

	const handleSignOut = () => {
		if (!window.confirm('Es-tu sûr de vouloir te déconnecter ?')) return
		supabase.auth.signOut()
	}

	const handleDeleteAccount = async () => {
		if (!user) return

		const confirmed = window.confirm(
			'Supprimer définitivement ton compte ? Ton profil, ta photo et tes amis seront effacés. Cette action est irréversible.',
		)
		if (!confirmed) return

		setDeleteError(undefined)
		setDeleting(true)

		try {
			await removeAvatars(user.id)

			const { error } = await supabase.rpc('delete_own_account')
			if (error) throw error

			await supabase.auth.signOut({ scope: 'local' })
		} catch {
			setDeleteError('Impossible de supprimer ton compte, réessaie')
			setDeleting(false)
		}
	}

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-8">
			<Link
				to="/profile"
				className="text-mist flex items-center gap-1 self-start text-sm transition-opacity active:opacity-60"
			>
				<ChevronLeft size={16} />
				Profil
			</Link>

			<h1 className="text-2xl font-semibold">Réglages</h1>

			<section className="flex flex-col gap-2.5">
				<div className="flex items-center justify-between">
					<h2 className="text-mist text-sm font-medium">
						Applications connectées
					</h2>

					<Button
						variant="secondary"
						size="sm"
						disabled
						aria-label="Connecter une application (bientôt disponible)"
					>
						<Plus size={16} />
					</Button>
				</div>

				<div className="bg-graphite border-slate rounded-xl border p-2.5">
					{connectedApps.length === 0 ? (
						<p className="text-mist text-sm">
							Aucune application connectée. Strava, Garmin et d’autres
							arriveront bientôt.
						</p>
					) : (
						<ul className="flex flex-col gap-2.5">
							{connectedApps.map((app) => (
								<li key={app.id} className="font-medium">
									{app.name}
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			<section className="flex flex-col gap-2.5">
				<div className="bg-graphite border-slate rounded-xl border p-2.5">
					<p className="text-mist text-sm">Email</p>
					<p className="break-all">{user?.email}</p>
				</div>

				<Button variant="danger" disabled={deleting} onClick={handleSignOut}>
					Se déconnecter
				</Button>

				<Button
					variant="danger"
					disabled={deleting}
					onClick={handleDeleteAccount}
				>
					{deleting ? 'Suppression…' : 'Supprimer mon compte'}
				</Button>

				<p className="text-mist text-center text-sm">
					La suppression du compte est définitive.
				</p>

				{deleteError && (
					<p role="alert" className="text-error text-center text-sm">
						{deleteError}
					</p>
				)}
			</section>
		</div>
	)
}
