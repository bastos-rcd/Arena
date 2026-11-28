import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'
import {
	PROFILE_COLUMNS,
	type Profile,
} from '@/features/profile/lib/use-profile'

import { supabase } from '@/lib/supabase'

const FRIENDSHIP_COLUMNS = `
	id,
	status,
	requester:profiles!friendships_requester_fkey(${PROFILE_COLUMNS}),
	addressee:profiles!friendships_addressee_fkey(${PROFILE_COLUMNS})
`

type FriendshipRow = {
	id: string
	status: 'pending' | 'accepted'
	requester: Profile
	addressee: Profile
}

export type Relation = {
	id: string
	kind: 'friend' | 'sent' | 'received'
	profile: Profile
}

export type FriendshipActions = Pick<
	ReturnType<typeof useFriendships>,
	'send' | 'accept' | 'remove'
>

const fetchFriendships = () =>
	supabase
		.from('friendships')
		.select(FRIENDSHIP_COLUMNS)
		.order('created_at', { ascending: false })
		.overrideTypes<FriendshipRow[], { merge: false }>()

function toRelation(row: FriendshipRow, userId: string): Relation {
	const isRequester = row.requester.id === userId

	return {
		id: row.id,
		kind:
			row.status === 'accepted' ? 'friend' : isRequester ? 'sent' : 'received',
		profile: isRequester ? row.addressee : row.requester,
	}
}

export function useFriendships() {
	const { user } = useAuth()
	const userId = user?.id

	const [rows, setRows] = useState<FriendshipRow[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		if (!userId) return

		let cancelled = false

		fetchFriendships().then(({ data }) => {
			if (cancelled) return
			setRows(data ?? [])
			setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [userId])

	const relations = useMemo(
		() => (userId ? rows.map((row) => toRelation(row, userId)) : []),
		[rows, userId],
	)

	const friends = useMemo(
		() => relations.filter(({ kind }) => kind === 'friend'),
		[relations],
	)

	const received = useMemo(
		() => relations.filter(({ kind }) => kind === 'received'),
		[relations],
	)

	const sent = useMemo(
		() => relations.filter(({ kind }) => kind === 'sent'),
		[relations],
	)

	const byProfileId = useMemo(
		() => new Map(relations.map((relation) => [relation.profile.id, relation])),
		[relations],
	)

	const reload = async () => {
		const { data } = await fetchFriendships()
		if (data) setRows(data)
	}

	const send = async (addresseeId: string) => {
		if (!userId) return { error: new Error('Non connecté') }

		const { error } = await supabase
			.from('friendships')
			.insert({ requester_id: userId, addressee_id: addresseeId })

		await reload()

		return { error }
	}

	const accept = async (id: string) => {
		const { error } = await supabase
			.from('friendships')
			.update({ status: 'accepted' })
			.eq('id', id)

		await reload()

		return { error }
	}

	const remove = async (id: string) => {
		const { error } = await supabase.from('friendships').delete().eq('id', id)

		await reload()

		return { error }
	}

	return {
		friends,
		received,
		sent,
		byProfileId,
		loading,
		send,
		accept,
		remove,
	}
}
