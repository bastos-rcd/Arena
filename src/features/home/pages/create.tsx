import { useState } from 'react'

import ActivityForm from '@/features/activities/components/activity-form'
import CompetitionForm from '@/features/competitions/components/competition-form'

const TABS = [
	{ id: 'competition', label: 'Compétition' },
	{ id: 'activity', label: 'Activité' },
]

export default function CreatePage() {
	const [tab, setTab] = useState<string>('competition')

	return (
		<div className="mx-auto flex max-w-sm flex-col gap-4">
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

			{tab === 'competition' ? <CompetitionForm /> : <ActivityForm />}
		</div>
	)
}
