import { Outlet } from 'react-router'

export default function AuthLayout() {
	return (
		<div className="pt-safe bg-ink fixed inset-0 overflow-y-auto overscroll-contain">
			<div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-start gap-4 p-4">
				<img src="/arena-logo.svg" alt="Arena" className="mx-auto size-20" />

				<Outlet />
			</div>
		</div>
	)
}
