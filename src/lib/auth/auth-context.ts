import { createContext, useContext } from 'react'

import type { Session, User } from '@supabase/supabase-js'

export const AuthContext = createContext<{
	session: Session | null
	user: User | null
	loading: boolean
} | null>(null)

export function useAuth() {
	const context = useContext(AuthContext)

	if (!context)
		throw new Error('useAuth must to be used within an AuthProvider')

	return context
}
