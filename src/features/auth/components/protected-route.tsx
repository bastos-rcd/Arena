import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/features/auth/lib/auth-context'

export default function ProtectedRoute() {
	const location = useLocation()

	const { session, loading } = useAuth()

	if (loading) return null

	return session ? (
		<Outlet />
	) : (
		<Navigate
			to="/login"
			replace
			state={{ from: location.pathname + location.search }}
		/>
	)
}
