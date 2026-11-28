import { useEffect, useState } from 'react'

import {
	ACTIVITY_COLUMNS,
	type Activity,
} from '@/features/activities/lib/activity'
import { removeActivityPhoto } from '@/features/activities/lib/activity-photo'

import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

const fetchActivities = (userId: string, from: number, to: number) =>
	supabase
		.from('activities')
		.select(ACTIVITY_COLUMNS, { count: 'exact' })
		.eq('user_id', userId)
		.order('activity_date', { ascending: false })
		.order('created_at', { ascending: false })
		.range(from, to)
		.overrideTypes<Activity[], { merge: false }>()

export function useActivities(userId: string) {
	const [activities, setActivities] = useState<Activity[]>([])
	const [total, setTotal] = useState<number>(0)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		setLoading(true)

		fetchActivities(userId, 0, PAGE_SIZE - 1).then(({ data, count }) => {
			if (cancelled) return

			setActivities(data ?? [])
			setTotal(count ?? 0)
			setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [userId])

	const loadMore = async () => {
		const { data, count, error } = await fetchActivities(
			userId,
			activities.length,
			activities.length + PAGE_SIZE - 1,
		)

		if (!error) {
			setActivities([...activities, ...(data ?? [])])
			setTotal(count ?? total)
		}

		return { error }
	}

	const reload = async () => {
		const { data, count } = await fetchActivities(
			userId,
			0,
			Math.max(activities.length, PAGE_SIZE) - 1,
		)

		setActivities(data ?? [])
		setTotal(count ?? 0)
	}

	const remove = async (activity: Activity) => {
		const { error } = await supabase
			.from('activities')
			.delete()
			.eq('id', activity.id)

		if (!error) {
			await removeActivityPhoto(activity.photo_path)
			await reload()
		}

		return { error }
	}

	return { activities, total, loading, loadMore, reload, remove }
}
