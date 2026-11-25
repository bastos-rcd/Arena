import { useEffect, useMemo, useState } from 'react'

import {
	COMPETITION_COLUMNS,
	type Competition,
} from '@/features/competitions/lib/competition'
import {
	getStatus,
	getToday,
} from '@/features/competitions/lib/competition-dates'

import { supabase } from '@/lib/supabase'

type CompetitionRow = Competition & {
	participants: { count: number }[]
}

export type CompetitionSummary = Competition & {
	participant_count: number
}

export function useCompetitions() {
	const [competitions, setCompetitions] = useState<CompetitionSummary[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		supabase
			.from('competitions')
			.select(
				`${COMPETITION_COLUMNS}, participants:competition_participants(count)`,
			)
			.overrideTypes<CompetitionRow[], { merge: false }>()
			.then(({ data }) => {
				if (cancelled) return

				setCompetitions(
					(data ?? []).map(({ participants, ...competition }) => ({
						...competition,
						participant_count: participants[0]?.count ?? 0,
					})),
				)
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	const { ongoing, upcoming, finished } = useMemo(() => {
		const today = getToday()

		const withStatus = (status: ReturnType<typeof getStatus>) =>
			competitions.filter(
				(competition) => getStatus(competition, today) === status,
			)

		return {
			ongoing: withStatus('ongoing').sort((a, b) =>
				a.end_date.localeCompare(b.end_date),
			),
			upcoming: withStatus('upcoming').sort((a, b) =>
				a.start_date.localeCompare(b.start_date),
			),
			finished: withStatus('finished').sort((a, b) =>
				b.end_date.localeCompare(a.end_date),
			),
		}
	}, [competitions])

	return { ongoing, upcoming, finished, loading }
}
