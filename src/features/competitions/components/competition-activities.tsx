import { useState } from 'react'

import Button from '@/components/ui/button'

import ActivityCard from '@/features/activities/components/activity-card'
import type { Activity } from '@/features/activities/lib/activity'
import Section from '@/features/friends/components/section'
import type { Profile } from '@/features/profile/lib/use-profile'

const PAGE_SIZE = 10

type CompetitionActivitiesProps = {
	activities: Activity[]
	participants: Profile[]
}

export default function CompetitionActivities({
	activities,
	participants,
}: CompetitionActivitiesProps) {
	const [visible, setVisible] = useState<number>(PAGE_SIZE)

	const profiles = new Map(participants.map((profile) => [profile.id, profile]))

	return (
		<Section title={`Activités · ${activities.length}`}>
			{activities.length === 0 && (
				<p className="text-mist text-sm">Aucune activité pour l'instant</p>
			)}

			{activities.slice(0, visible).map((activity) => (
				<ActivityCard
					key={activity.id}
					activity={activity}
					author={profiles.get(activity.user_id)}
				/>
			))}

			{activities.length > visible && (
				<Button
					variant="secondary"
					onClick={() => setVisible(visible + PAGE_SIZE)}
				>
					Voir plus
				</Button>
			)}
		</Section>
	)
}
