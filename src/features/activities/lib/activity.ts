import type { Sport } from '@/features/competitions/lib/competition'

export type Activity = {
	id: string
	user_id: string
	name: string
	sport: Sport
	activity_date: string
	distance: number
	duration: number
	elevation_gain: number
	steps: number | null
	photo_path: string
}

export const ACTIVITY_COLUMNS =
	'id, user_id, name, sport, activity_date, distance, duration, elevation_gain, steps, photo_path'
