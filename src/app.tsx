import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import AuthProvider from '@/components/auth-provider'
import Layout from '@/components/layout'

import HomePage from '@/pages/home'
import GuestRoute from './components/guest-route'
import AuthLayout from './components/auth-layout'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import ProtectedRoute from './components/protected-route'

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

							<Route path="*" element={<Navigate to="/" replace />} />
						</Route>
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}
