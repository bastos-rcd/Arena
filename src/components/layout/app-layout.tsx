import { Outlet } from 'react-router'

import TabBar from '@/components/layout/tab-bar'

import { useFriendships } from '@/features/friends/lib/friendships-context'

export default function AppLayout() {
	const { received } = useFriendships()

	return (
		<div className="pt-safe bg-ink sm:border-graphite fixed inset-0 mx-auto flex w-full max-w-xl flex-col sm:border-x">
			<main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5">
				<Outlet />
			</main>

			<TabBar badges={{ '/friends': received.length }} />
		</div>
	)
}
