import { Navigate, Outlet } from 'react-router'

import { useAuth } from '@/features/auth/lib/auth-context'

export default function PublicRoute() {
	const { session, loading } = useAuth()

	if (loading) return null

	return session ? <Navigate to="/" replace /> : <Outlet />
}
