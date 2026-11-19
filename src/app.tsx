import { BrowserRouter } from 'react-router'

import AppRoutes from '@/app-routes'

import AuthProvider from '@/features/auth/components/auth-provider'

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	)
}
