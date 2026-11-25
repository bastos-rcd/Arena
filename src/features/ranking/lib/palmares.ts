import type {
	CompetitionType,
	Sport,
} from '@/features/competitions/lib/competition'

export type PalmaresRow = {
	sport: Sport
	type: CompetitionType
	played: number
	wins: number
	podiums: number
	ranked: number
	rank_sum: number
}

type Key = 'played' | 'wins' | 'podiums' | 'ranked' | 'rank_sum'

export function getTotals(rows: PalmaresRow[]) {
	const sum = (key: Key) => rows.reduce((total, row) => total + row[key], 0)

	const played = sum('played')
	const wins = sum('wins')
	const ranked = sum('ranked')

	return {
		played,
		wins,
		defeats: played - wins,
		podiums: sum('podiums'),
		winRate: played > 0 ? Math.round((wins / played) * 100) : 0,
		averageRank: ranked > 0 ? sum('rank_sum') / ranked : null,
	}
}
