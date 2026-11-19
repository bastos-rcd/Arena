import {
	Handshake,
	House,
	Plus,
	Trophy,
	User,
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
	{ to: '/profile', icon: User },
]

type TabBarProps = {
	badges?: Record<string, number>
}

export default function TabBar({ badges = {} }: TabBarProps) {
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
									<span className="relative">
										<Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />

										{badges[to] > 0 && (
											<span className="bg-volt text-ink absolute -top-1.5 -right-2.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold">
												{badges[to] > 9 ? '9+' : badges[to]}
											</span>
										)}
									</span>
								)}
							</NavLink>
						)}
					</li>
				))}
			</ul>
		</nav>
	)
}
