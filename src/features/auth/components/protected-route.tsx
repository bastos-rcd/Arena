import { Navigate, Outlet } from 'react-router'

import { useAuth } from '@/features/auth/lib/auth-context'

export default function ProtectedRoute() {
	const { session, loading } = useAuth()

	if (loading) return null

	return session ? <Outlet /> : <Navigate to="/login" replace />
}
