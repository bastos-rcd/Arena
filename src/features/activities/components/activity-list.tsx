import Button from '@/components/ui/button'

import ActivityCard from '@/features/activities/components/activity-card'
import EditableActivityCard from '@/features/activities/components/editable-activity-card'
import { useActivities } from '@/features/activities/lib/use-activities'
import Section from '@/features/friends/components/section'
import { useAction } from '@/features/friends/lib/use-action'

type ActivityListProps = {
	userId: string
	editable?: boolean
}

export default function ActivityList({ userId, editable }: ActivityListProps) {
	const { activities, total, loading, loadMore, reload, remove } =
		useActivities(userId)

	const loadingMore = useAction()

	if (loading) return null

	return (
		<Section title={`Activités · ${total}`}>
			{activities.length === 0 && (
				<p className="text-mist text-sm">Aucune activité</p>
			)}

			{activities.map((activity) =>
				editable ? (
					<EditableActivityCard
						key={activity.id}
						activity={activity}
						onChanged={reload}
						onDelete={remove}
					/>
				) : (
					<ActivityCard key={activity.id} activity={activity} showSport />
				),
			)}

			{activities.length < total && (
				<Button
					variant="secondary"
					loading={loadingMore.loading}
					onClick={() => loadingMore.run(loadMore)}
				>
					Voir plus
				</Button>
			)}
		</Section>
	)
}
