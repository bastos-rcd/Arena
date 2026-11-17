import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import Layout from '@/components/layout'

import HomePage from '@/pages/home'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<HomePage />} />

					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
