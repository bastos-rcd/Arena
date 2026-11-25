import { useEffect, useState } from 'react'

import {
	ACTIVITY_COLUMNS,
	type Activity,
} from '@/features/activities/lib/activity'
import type { Profile } from '@/features/profile/lib/use-profile'

import { supabase } from '@/lib/supabase'

export type Standing = {
	user_id: string
	score: number | null
	rank: number | null
	activity_count: number
}

export function useCompetitionResults(id: string, participants: Profile[]) {
	const [standings, setStandings] = useState<Standing[]>([])
	const [activities, setActivities] = useState<Activity[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	const participantKey = participants.map((profile) => profile.id).join(',')

	useEffect(() => {
		if (!participantKey) return

		let cancelled = false

		Promise.all([
			supabase
				.from('competition_standings')
				.select('user_id, score, rank, activity_count')
				.eq('competition_id', id)
				.overrideTypes<Standing[], { merge: false }>(),
			supabase
				.from('competition_activities')
				.select(ACTIVITY_COLUMNS)
				.eq('competition_id', id)
				.order('activity_date', { ascending: false })
				.order('created_at', { ascending: false })
				.overrideTypes<Activity[], { merge: false }>(),
		]).then(([standingsResult, activitiesResult]) => {
			if (cancelled) return

			setStandings(standingsResult.data ?? [])
			setActivities(activitiesResult.data ?? [])
			setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [id, participantKey])

	return { standings, activities, loading }
}
