import { Check, X } from 'lucide-react'
import { useState } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import InviteButton from '@/features/friends/components/invite-button'
import UserRow from '@/features/friends/components/user-row'

import { useFriendships } from '@/features/friends/lib/friendships-context'
import { useProfileSearch } from '@/features/friends/lib/use-profile-search'

export default function FriendsPage() {
	const { friends, received, sent, loading, acceptRequest, removeFriendship } =
		useFriendships()

	const [query, setQuery] = useState('')
	const [busyId, setBusyId] = useState<string>()
	const [error, setError] = useState<string>()

	const { ready, searching, results } = useProfileSearch(query)

	const run = async (
		id: string,
		action: (id: string) => Promise<{ error: unknown }>,
	) => {
		setError(undefined)
		setBusyId(id)

		const { error } = await action(id)
		if (error) setError('Une erreur est survenue, réessaie')

		setBusyId(undefined)
	}

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-8">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Amis</h1>
				<InviteButton />
			</header>

			<Field
				label="Rechercher un pseudo"
				name="search"
				value={query}
				onChange={(event) => setQuery(event.currentTarget.value)}
				autoComplete="off"
				autoCapitalize="none"
				autoCorrect="off"
				spellCheck={false}
			/>

			{error && (
				<p role="alert" className="text-error text-center text-sm">
					{error}
				</p>
			)}

			{ready ? (
				<section className="flex flex-col gap-2.5">
					{searching ? (
						<p className="text-mist text-center text-sm">Recherche…</p>
					) : results.length === 0 ? (
						<p className="text-mist text-center text-sm">
							Aucun utilisateur trouvé.
						</p>
					) : (
						<ul className="flex flex-col gap-2.5">
							{results.map((profile) => (
								<UserRow key={profile.id} profile={profile} />
							))}
						</ul>
					)}
				</section>
			) : (
				!loading && (
					<>
						{received.length > 0 && (
							<section className="flex flex-col gap-2.5">
								<h2 className="text-mist text-sm font-medium">
									Demandes reçues
								</h2>

								<ul className="flex flex-col gap-2.5">
									{received.map(({ id, profile }) => (
										<UserRow key={id} profile={profile}>
											<Button
												size="sm"
												disabled={busyId === id}
												onClick={() => run(id, acceptRequest)}
												aria-label="Accepter"
											>
												<Check size={16} />
											</Button>
											<Button
												variant="secondary"
												size="sm"
												disabled={busyId === id}
												onClick={() => run(id, removeFriendship)}
												aria-label="Refuser"
											>
												<X size={16} />
											</Button>
										</UserRow>
									))}
								</ul>
							</section>
						)}

						<section className="flex flex-col gap-2.5">
							<h2 className="text-mist text-sm font-medium">
								Mes amis ({friends.length})
							</h2>

							{friends.length === 0 ? (
								<p className="text-mist text-sm">
									Pas encore d’ami. Cherche un pseudo ou partage ton lien
									d’invitation.
								</p>
							) : (
								<ul className="flex flex-col gap-2.5">
									{friends.map(({ id, profile }) => (
										<UserRow key={id} profile={profile} />
									))}
								</ul>
							)}
						</section>

						{sent.length > 0 && (
							<section className="flex flex-col gap-2.5">
								<h2 className="text-mist text-sm font-medium">
									Demandes envoyées
								</h2>

								<ul className="flex flex-col gap-2.5">
									{sent.map(({ id, profile }) => (
										<UserRow key={id} profile={profile}>
											<Button
												variant="secondary"
												size="sm"
												disabled={busyId === id}
												onClick={() => run(id, removeFriendship)}
											>
												Annuler
											</Button>
										</UserRow>
									))}
								</ul>
							</section>
						)}
					</>
				)
			)}
		</div>
	)
}
