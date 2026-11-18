import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import AuthLayout from '@/components/auth-layout'
import AuthProvider from '@/components/auth-provider'
import GuestRoute from '@/components/guest-route'
import Layout from '@/components/layout'
import ProtectedRoute from '@/components/protected-route'

import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import ProfilePage from '@/pages/profile'
import RegisterPage from '@/pages/register'

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route element={<GuestRoute />}>
						<Route element={<AuthLayout />}>
							<Route path="login" element={<LoginPage />} />
							<Route path="register" element={<RegisterPage />} />
						</Route>
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route element={<Layout />}>
							<Route index element={<HomePage />} />
							<Route path="profile" element={<ProfilePage />} />

							<Route path="*" element={<Navigate to="/" replace />} />
						</Route>
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}
