import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'
import {
	FriendshipsContext,
	type FriendProfile,
	type FriendshipItem,
	type Relation,
} from '@/features/friends/lib/friendships-context'

import { supabase } from '@/lib/supabase'

type FriendshipRow = {
	id: string
	status: 'pending' | 'accepted'
	requester: FriendProfile
	addressee: FriendProfile
}

const PROFILE_COLUMNS = 'id, username, display_name, avatar_path'

const FRIENDSHIP_COLUMNS = `
	id,
	status,
	requester:profiles!friendships_requester_fkey(${PROFILE_COLUMNS}),
	addressee:profiles!friendships_addressee_fkey(${PROFILE_COLUMNS})
`

const UNIQUE_VIOLATION = '23505'

type FriendshipsProviderProps = {
	children: ReactNode
}

export default function FriendshipsProvider({
	children,
}: FriendshipsProviderProps) {
	const { user } = useAuth()
	const userId = user?.id

	const [rows, setRows] = useState<FriendshipRow[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		const { data } = await supabase
			.from('friendships')
			.select(FRIENDSHIP_COLUMNS)

		setRows((data ?? []) as unknown as FriendshipRow[])
		setLoading(false)
	}, [])

	useEffect(() => {
		if (!userId) return

		load()

		const channel = supabase
			.channel('friendships')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'friendships' },
				() => load(),
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [userId, load])

	const sendRequest = useCallback(
		async (addresseeId: string) => {
			if (!userId) return { error: new Error('Non connecté') }

			const { error } = await supabase
				.from('friendships')
				.insert({ requester_id: userId, addressee_id: addresseeId })

			await load()

			if (error?.code === UNIQUE_VIOLATION) return { error: null }

			return { error }
		},
		[userId, load],
	)

	const acceptRequest = useCallback(
		async (friendshipId: string) => {
			const { error } = await supabase
				.from('friendships')
				.update({ status: 'accepted' })
				.eq('id', friendshipId)

			await load()
			return { error }
		},
		[load],
	)

	const removeFriendship = useCallback(
		async (friendshipId: string) => {
			const { error } = await supabase
				.from('friendships')
				.delete()
				.eq('id', friendshipId)

			await load()
			return { error }
		},
		[load],
	)

	const value = useMemo(() => {
		const friends: FriendshipItem[] = []
		const received: FriendshipItem[] = []
		const sent: FriendshipItem[] = []
		const relations = new Map<string, Relation>()

		for (const row of rows) {
			const isRequester = row.requester.id === userId
			const profile = isRequester ? row.addressee : row.requester
			const item = { id: row.id, profile }

			if (row.status === 'accepted') {
				friends.push(item)
				relations.set(profile.id, { status: 'friends', friendshipId: row.id })
			} else if (isRequester) {
				sent.push(item)
				relations.set(profile.id, { status: 'sent', friendshipId: row.id })
			} else {
				received.push(item)
				relations.set(profile.id, { status: 'received', friendshipId: row.id })
			}
		}

		const byUsername = (a: FriendshipItem, b: FriendshipItem) =>
			a.profile.username.localeCompare(b.profile.username)

		friends.sort(byUsername)
		received.sort(byUsername)
		sent.sort(byUsername)

		const getRelation = (id: string): Relation =>
			relations.get(id) ?? { status: 'none' }

		return { friends, received, sent, getRelation }
	}, [rows, userId])

	return (
		<FriendshipsContext
			value={{
				...value,
				loading,
				sendRequest,
				acceptRequest,
				removeFriendship,
			}}
		>
			{children}
		</FriendshipsContext>
	)
}
