import { useEffect, useState, type ReactNode } from 'react'

import type { Session } from '@supabase/supabase-js'

import { AuthContext } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

type AuthProviderProps = {
	children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [])

	return (
		<AuthContext value={{ session, user: session?.user ?? null, loading }}>
			{children}
		</AuthContext>
	)
}
