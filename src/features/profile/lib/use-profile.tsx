import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'

import { supabase } from '@/lib/supabase'

export const PROFILE_COLUMNS = 'id, username, full_name, avatar_url'

export type Profile = {
	id: string
	username: string
	full_name: string
	avatar_url: string | null
}

type ProfileChanges = Partial<Pick<Profile, 'full_name' | 'avatar_url'>>

export function useProfile() {
	const { user } = useAuth()
	const userId = user?.id

	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!userId) return

		let cancelled = false

		supabase
			.from('profiles')
			.select(PROFILE_COLUMNS)
			.eq('id', userId)
			.single<Profile>()
			.then(({ data }) => {
				if (cancelled) return
				setProfile(data)
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [userId])

	const updateProfile = useCallback(
		async (changes: ProfileChanges) => {
			if (!userId) return { error: new Error('Non connecté') }

			const { data, error } = await supabase
				.from('profiles')
				.update(changes)
				.eq('id', userId)
				.select(PROFILE_COLUMNS)
				.single<Profile>()

			if (!error) setProfile(data)

			return { error }
		},
		[userId],
	)

	return { profile, loading, updateProfile }
}
