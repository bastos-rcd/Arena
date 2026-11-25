export type Sport = 'running' | 'cycling' | 'walking'

export type CompetitionType =
	| 'total_distance'
	| 'longest_distance'
	| 'activity_count'
	| 'best_time'
	| 'total_elevation'
	| 'best_elevation'
	| 'total_steps'

export type Competition = {
	id: string
	owner_id: string
	name: string
	description: string | null
	sport: Sport
	type: CompetitionType
	target_distance: number | null
	start_date: string
	end_date: string
}

export const COMPETITION_COLUMNS =
	'id, owner_id, name, description, sport, type, target_distance, start_date, end_date'
