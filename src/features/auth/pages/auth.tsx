import { useState } from 'react'

import SignInForm from '@/features/auth/components/sign-in-form'
import SignUpForm from '@/features/auth/components/sign-up-form'

const TABS = [
	{ id: 'signin', label: 'Connexion' },
	{ id: 'signup', label: 'Inscription' },
]

export default function AuthPage() {
	const [tab, setTab] = useState<string>('signin')

	return (
		<>
			<header className="border-slate bg-graphite flex rounded-4xl border p-2">
				{TABS.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						onClick={() => setTab(id)}
						className={`flex-1 rounded-3xl p-2 text-sm font-semibold transition-colors duration-200 ${
							tab === id ? 'bg-volt text-ink' : 'text-mist'
						}`}
					>
						{label}
					</button>
				))}
			</header>

			{tab === 'signin' ? <SignInForm /> : <SignUpForm />}
		</>
	)
}
