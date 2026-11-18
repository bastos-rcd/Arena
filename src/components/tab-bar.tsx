import {
	Handshake,
	House,
	Plus,
	Settings,
	Trophy,
	type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router'

type Tab = {
	to: string
	icon: LucideIcon
	isPrimary?: boolean
}

const TABS: Tab[] = [
	{ to: '/', icon: House },
	{ to: '/ranking', icon: Trophy },
	{ to: '/new', icon: Plus, isPrimary: true },
	{ to: '/friends', icon: Handshake },
	{ to: '/profile', icon: Settings },
]

export default function TabBar() {
	return (
		<nav className="border-slate bg-graphite shrink-0 border-t p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
			<ul className="grid grid-cols-5">
				{TABS.map(({ to, icon: Icon, isPrimary }) => (
					<li key={to} className="flex">
						{isPrimary ? (
							<NavLink
								to={to}
								className="bg-volt text-ink m-auto flex size-12 items-center justify-center rounded-2xl transition-transform active:scale-90"
							>
								<Icon size={24} strokeWidth={2.25} />
							</NavLink>
						) : (
							<NavLink
								to={to}
								end={to === '/'}
								className={({ isActive }) =>
									`flex flex-1 flex-col items-center justify-center transition-colors active:opacity-50 ${
										isActive ? 'text-volt' : 'text-mist'
									}`
								}
							>
								{({ isActive }) => (
									<Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
								)}
							</NavLink>
						)}
					</li>
				))}
			</ul>
		</nav>
	)
}
