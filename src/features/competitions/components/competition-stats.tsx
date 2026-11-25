import Stat from '@/components/ui/stat'

import type { Activity } from '@/features/activities/lib/activity'
import type { Sport } from '@/features/competitions/lib/competition'
import Section from '@/features/friends/components/section'

import { formatDuration, formatNumber } from '@/lib/format'

type CompetitionStatsProps = {
	sport: Sport
	activities: Activity[]
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

export default function CompetitionStats({
	sport,
	activities,
}: CompetitionStatsProps) {
	return (
		<Section title="Statistiques du groupe">
			<div className="grid grid-cols-2 gap-2.5">
				<Stat label="Activités" value={String(activities.length)} />

				<Stat
					label="Distance"
					value={`${formatNumber(sum(activities.map((a) => a.distance)))} km`}
				/>

				{sport === 'walking' ? (
					<Stat
						label="Pas"
						value={formatNumber(sum(activities.map((a) => a.steps ?? 0)))}
					/>
				) : (
					<Stat
						label="Durée"
						value={formatDuration(sum(activities.map((a) => a.duration)))}
					/>
				)}

				<Stat
					label="Dénivelé"
					value={`${formatNumber(sum(activities.map((a) => a.elevation_gain)))} m`}
				/>
			</div>
		</Section>
	)
}
