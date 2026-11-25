import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import Button from '@/components/ui/button'

import ActivityCard from '@/features/activities/components/activity-card'
import ActivityForm from '@/features/activities/components/activity-form'
import type { Activity } from '@/features/activities/lib/activity'
import { getActivityErrorMessage } from '@/features/activities/lib/activity-errors'

type EditableActivityCardProps = {
	activity: Activity
	onChanged: () => Promise<void>
	onDelete: (
		activity: Activity,
	) => Promise<{ error: { message?: string } | null }>
}

export default function EditableActivityCard({
	activity,
	onChanged,
	onDelete,
}: EditableActivityCardProps) {
	const [editing, setEditing] = useState<boolean>(false)
	const [deleting, setDeleting] = useState<boolean>(false)

	const handleDone = async () => {
		await onChanged()
		setEditing(false)
	}

	const handleDelete = async () => {
		if (!window.confirm('Supprimer définitivement cette activité ?')) return

		setDeleting(true)

		const { error } = await onDelete(activity)

		if (error) {
			alert(getActivityErrorMessage(error))
			setDeleting(false)
		}
	}

	if (editing) {
		return (
			<div className="bg-graphite border-slate rounded-xl border p-2.5">
				<ActivityForm
					activity={activity}
					onDone={handleDone}
					onCancel={() => setEditing(false)}
				/>
			</div>
		)
	}

	return (
		<ActivityCard activity={activity} showSport>
			<div className="flex shrink-0 flex-col gap-1.5">
				<Button
					variant="secondary"
					aria-label="Modifier l'activité"
					disabled={deleting}
					className="size-9 p-0"
					onClick={() => setEditing(true)}
				>
					<Pencil size={18} />
				</Button>

				<Button
					variant="danger"
					aria-label="Supprimer l'activité"
					loading={deleting}
					className="size-9 p-0"
					onClick={handleDelete}
				>
					<Trash2 size={18} />
				</Button>
			</div>
		</ActivityCard>
	)
}
