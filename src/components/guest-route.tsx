import { Navigate, Outlet } from 'react-router'

import { useAuth } from '@/lib/auth/auth-context'

export default function GuestRoute() {
	const { session, loading } = useAuth()

	if (loading) return null

	return session ? <Navigate to="/" replace /> : <Outlet />
}
