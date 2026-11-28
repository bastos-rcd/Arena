import { useEffect, useState } from 'react'

import {
	PROFILE_COLUMNS,
	type Profile,
} from '@/features/profile/lib/use-profile'

import { supabase } from '@/lib/supabase'

export function useUserProfile(username: string) {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		setLoading(true)

		supabase
			.from('profiles')
			.select(PROFILE_COLUMNS)
			.eq('username', username.toLowerCase())
			.maybeSingle<Profile>()
			.then(({ data }) => {
				if (cancelled) return
				setProfile(data)
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [username])

	return { profile, loading }
}
