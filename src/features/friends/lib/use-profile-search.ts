import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'
import type { FriendProfile } from '@/features/friends/lib/friendships-context'

import { supabase } from '@/lib/supabase'

export const SEARCH_MIN_LENGTH = 2
const SEARCH_DELAY = 300
const SEARCH_LIMIT = 20

function escapeLike(value: string) {
	return value.replace(/[\\%_]/g, '\\$&')
}

export function useProfileSearch(query: string) {
	const { user } = useAuth()
	const userId = user?.id

	const term = query.trim().replace(/^@/, '')
	const ready = term.length >= SEARCH_MIN_LENGTH

	const [found, setFound] = useState<{
		term: string
		profiles: FriendProfile[]
	}>()

	useEffect(() => {
		if (!ready || !userId) return

		let cancelled = false

		const timer = setTimeout(async () => {
			const { data } = await supabase
				.from('profiles')
				.select('id, username, display_name, avatar_path')
				.ilike('username', `${escapeLike(term)}%`)
				.neq('id', userId)
				.order('username')
				.limit(SEARCH_LIMIT)

			if (!cancelled)
				setFound({ term, profiles: (data ?? []) as FriendProfile[] })
		}, SEARCH_DELAY)

		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [term, ready, userId])

	const searching = ready && found?.term !== term
	const results = ready && found?.term === term ? found.profiles : []

	return { ready, searching, results }
}
