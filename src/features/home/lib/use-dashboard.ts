import { useEffect, useState } from 'react'

import {
	addDays,
	getToday,
} from '@/features/competitions/lib/competition-dates'
import type { Standing } from '@/features/competitions/lib/use-competition-results'

import { supabase } from '@/lib/supabase'

export type CompetitionStanding = Standing & {
	competition_id: string
}

export function useDashboard(competitionIds: string[], userId: string) {
	const [standings, setStandings] = useState<
		Map<string, CompetitionStanding[]>
	>(new Map())
	const [weekCount, setWeekCount] = useState<number>(0)
	const [loading, setLoading] = useState<boolean>(true)

	const idsKey = competitionIds.join(',')

	useEffect(() => {
		let cancelled = false

		const ids = idsKey ? idsKey.split(',') : []

		Promise.all([
			ids.length > 0
				? supabase
						.from('competition_standings')
						.select('competition_id, user_id, score, rank, activity_count')
						.in('competition_id', ids)
						.overrideTypes<CompetitionStanding[], { merge: false }>()
				: Promise.resolve({ data: [] as CompetitionStanding[] }),
			supabase
				.from('activities')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.gte('activity_date', addDays(getToday(), -6)),
		]).then(([standingsResult, weekResult]) => {
			if (cancelled) return

			const grouped = new Map<string, CompetitionStanding[]>()

			for (const row of standingsResult.data ?? []) {
				grouped.set(row.competition_id, [
					...(grouped.get(row.competition_id) ?? []),
					row,
				])
			}

			setStandings(grouped)
			setWeekCount(weekResult.count ?? 0)
			setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [idsKey, userId])

	return { standings, weekCount, loading }
}
