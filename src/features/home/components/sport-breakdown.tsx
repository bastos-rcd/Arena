import type { Sport } from '@/features/competitions/lib/competition'
import { SPORTS, TYPES } from '@/features/competitions/lib/competition-config'
import type { CompetitionSummary } from '@/features/competitions/lib/use-competitions'
import Section from '@/features/friends/components/section'

type SportBreakdownProps = {
	competitions: CompetitionSummary[]
}

export default function SportBreakdown({ competitions }: SportBreakdownProps) {
	const sports = (Object.keys(SPORTS) as Sport[]).flatMap((sport) => {
		const items = competitions.filter((c) => c.sport === sport)

		return items.length > 0 ? [{ sport, items }] : []
	})

	return (
		<Section title="Répartition">
			{sports.map(({ sport, items }) => {
				const { icon: Icon, label, types } = SPORTS[sport]

				return (
					<div
						key={sport}
						className="bg-graphite border-slate flex flex-col gap-2.5 rounded-xl border p-2.5"
					>
						<div className="flex items-center gap-2.5">
							<span className="bg-slate flex size-8 shrink-0 items-center justify-center rounded-full">
								<Icon size={16} />
							</span>

							<span className="flex-1 truncate font-medium">{label}</span>
							<span className="text-mist">{items.length}</span>
						</div>

						<div className="flex flex-wrap gap-1.5">
							{types.flatMap((type) => {
								const count = items.filter((c) => c.type === type).length

								return count > 0
									? [
											<span
												key={type}
												className="bg-slate rounded-full px-2.5 py-1 text-xs"
											>
												{TYPES[type].label} · {count}
											</span>,
										]
									: []
							})}
						</div>
					</div>
				)
			})}
		</Section>
	)
}
