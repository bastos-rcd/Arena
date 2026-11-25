import { Navigate, Route, Routes } from 'react-router'

import AppLayout from '@/components/layout/app-layout'
import AuthLayout from '@/components/layout/auth-layout'

import ProtectedRoute from '@/features/auth/components/protected-route'
import PublicRoute from '@/features/auth/components/public-route'
import AuthPage from '@/features/auth/pages/auth'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password'
import ResetPasswordPage from '@/features/auth/pages/reset-password'

import CompetitionPage from '@/features/competitions/pages/competition'

import FriendsPage from '@/features/friends/pages/friends'

import CreatePage from '@/features/home/pages/create'
import HomePage from '@/features/home/pages/home'

import ProfilePage from '@/features/profile/pages/profile'
import UserProfilePage from '@/features/profile/pages/user-profile'

import RankingPage from '@/features/ranking/pages/ranking'

export default function AppRoutes() {
	return (
		<Routes>
			<Route element={<PublicRoute />}>
				<Route element={<AuthLayout />}>
					<Route path="auth" element={<AuthPage />} />
					<Route path="forgot-password" element={<ForgotPasswordPage />} />
				</Route>
			</Route>

			<Route element={<AuthLayout />}>
				<Route path="reset-password" element={<ResetPasswordPage />} />
			</Route>

			<Route element={<ProtectedRoute />}>
				<Route element={<AppLayout />}>
					<Route index element={<HomePage />} />
					<Route path="create" element={<CreatePage />} />
					<Route path="competitions/:id" element={<CompetitionPage />} />
					<Route path="friends" element={<FriendsPage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="ranking" element={<RankingPage />} />
					<Route path="u/:username" element={<UserProfilePage />} />

					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Route>
		</Routes>
	)
}
