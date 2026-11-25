import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'
import {
	PROFILE_COLUMNS,
	type Profile,
} from '@/features/profile/lib/use-profile'

import { supabase } from '@/lib/supabase'

export const SEARCH_MIN_LENGTH = 2

export function useSearch(term: string) {
	const { user } = useAuth()
	const userId = user?.id

	const [results, setResults] = useState<Profile[]>([])
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		const query = term.trim().replace(/[^\p{L}\p{N}_\- ]/gu, '')

		if (!userId || query.length < SEARCH_MIN_LENGTH) {
			setResults([])
			setLoading(false)
			return
		}

		let cancelled = false

		setLoading(true)

		supabase
			.from('profiles')
			.select(PROFILE_COLUMNS)
			.neq('id', userId)
			.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
			.order('username')
			.limit(20)
			.overrideTypes<Profile[], { merge: false }>()
			.then(({ data }) => {
				if (cancelled) return
				setResults(data ?? [])
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [term, userId])

	return { results, loading }
}
