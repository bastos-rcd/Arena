import { Navigate, Route, Routes } from 'react-router'

import AppLayout from '@/components/layout/app-layout'
import AuthLayout from '@/components/layout/auth-layout'

import ProtectedRoute from '@/features/auth/components/protected-route'
import PublicRoute from '@/features/auth/components/public-route'

import LoginPage from '@/features/auth/pages/login'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password'
import RegisterPage from '@/features/auth/pages/register'
import ResetPasswordPage from '@/features/auth/pages/reset-password'

import HomePage from '@/features/home/pages/home'

import ProfilePage from '@/features/profile/pages/profile'

import SettingsPage from '@/features/settings/pages/settings'

export default function AppRoutes() {
	return (
		<Routes>
			<Route element={<PublicRoute />}>
				<Route element={<AuthLayout />}>
					<Route path="login" element={<LoginPage />} />
					<Route path="forgot-password" element={<ForgotPasswordPage />} />
					<Route path="register" element={<RegisterPage />} />
				</Route>
			</Route>

			<Route element={<AuthLayout />}>
				<Route path="reset-password" element={<ResetPasswordPage />} />
			</Route>

			<Route element={<ProtectedRoute />}>
				<Route element={<AppLayout />}>
					<Route index element={<HomePage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="settings" element={<SettingsPage />} />

					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Route>
		</Routes>
	)
}
