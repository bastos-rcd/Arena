import { Check, Share } from 'lucide-react'
import { useState } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import RelationCard from '@/features/friends/components/relation-card'
import SearchResultCard from '@/features/friends/components/search-result-card'
import Section from '@/features/friends/components/section'
import { useFriendships } from '@/features/friends/lib/use-friendships'
import { SEARCH_MIN_LENGTH, useSearch } from '@/features/friends/lib/use-search'
import { useProfile } from '@/features/profile/lib/use-profile'

import { useDebouncedValue } from '@/lib/use-debounced-value'

export default function FriendsPage() {
	const { profile } = useProfile()
	const {
		friends,
		received,
		sent,
		byProfileId,
		loading,
		send,
		accept,
		remove,
	} = useFriendships()

	const [search, setSearch] = useState<string>('')
	const [copied, setCopied] = useState<boolean>(false)

	const debouncedSearch = useDebouncedValue(search)
	const { results, loading: searching } = useSearch(debouncedSearch)

	if (loading) return null

	const actions = { send, accept, remove }

	const trimmed = search.trim()
	const searchReady = trimmed.length >= SEARCH_MIN_LENGTH
	const searchPending = searching || search !== debouncedSearch

	const handleShare = async () => {
		if (!profile) return

		const url = `${window.location.origin}/u/${profile.username}`

		if (navigator.share) {
			await navigator
				.share({ title: 'Arena', text: 'Rejoins-moi sur Arena !', url })
				.catch(() => {})
			return
		}

		if (!navigator.clipboard) return

		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="flex flex-col gap-4">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Amis</h1>

				<Button
					variant="secondary"
					disabled={!profile}
					onClick={handleShare}
					className="size-10"
				>
					{copied ? <Check size={20} /> : <Share size={20} />}
				</Button>
			</header>

			<Field
				label="Rechercher"
				placeholder="Pseudo ou nom"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				autoCapitalize="none"
				autoCorrect="off"
				spellCheck={false}
			/>

			{trimmed ? (
				<Section title="Résultats">
					{!searchReady && (
						<p className="text-mist text-sm">
							Entrer au moins {SEARCH_MIN_LENGTH} caractères
						</p>
					)}

					{searchReady && !searchPending && results.length === 0 && (
						<p className="text-mist text-sm">Aucun résultat</p>
					)}

					{searchReady &&
						results.map((result) => (
							<SearchResultCard
								key={result.id}
								profile={result}
								relation={byProfileId.get(result.id)}
								actions={actions}
							/>
						))}
				</Section>
			) : (
				<>
					{received.length > 0 && (
						<Section title={`Demandes reçues · ${received.length}`}>
							{received.map((relation) => (
								<RelationCard
									key={relation.id}
									relation={relation}
									actions={actions}
								/>
							))}
						</Section>
					)}

					<Section title={`Amis · ${friends.length}`}>
						{friends.length === 0 && (
							<p className="text-mist text-sm">Aucun ami pour le moment</p>
						)}

						{friends.map((relation) => (
							<RelationCard
								key={relation.id}
								relation={relation}
								actions={actions}
							/>
						))}
					</Section>

					{sent.length > 0 && (
						<Section title={`Demandes envoyées · ${sent.length}`}>
							{sent.map((relation) => (
								<RelationCard
									key={relation.id}
									relation={relation}
									actions={actions}
								/>
							))}
						</Section>
					)}
				</>
			)}
		</div>
	)
}
