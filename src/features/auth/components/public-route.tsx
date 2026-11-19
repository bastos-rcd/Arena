import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/features/auth/lib/auth-context'
import { getRedirectPath } from '@/features/auth/lib/redirect'

export default function PublicRoute() {
	const location = useLocation()

	const { session, loading } = useAuth()

	if (loading) return null

	return session ? (
		<Navigate to={getRedirectPath(location.state)} replace />
	) : (
		<Outlet />
	)
}
