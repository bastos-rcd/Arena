import type { Competition } from '@/features/competitions/lib/competition'

export type CompetitionStatus = 'upcoming' | 'ongoing' | 'finished'

type Period = Pick<Competition, 'start_date' | 'end_date'>

const TIMEZONE = 'Europe/Paris'
const DAY = 24 * 60 * 60 * 1000

export function getToday() {
	return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(
		new Date(),
	)
}

export function addDays(date: string, days: number) {
	const result = new Date(`${date}T00:00:00Z`)
	result.setUTCDate(result.getUTCDate() + days)

	return result.toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string) {
	return Math.round(
		(Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY,
	)
}

export function formatDate(date: string) {
	return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

export function getStatus(
	{ start_date, end_date }: Period,
	today = getToday(),
): CompetitionStatus {
	if (start_date > today) return 'upcoming'
	if (end_date < today) return 'finished'

	return 'ongoing'
}

export function getStatusLabel(period: Period, today = getToday()) {
	const status = getStatus(period, today)

	if (status === 'upcoming') {
		const days = daysBetween(today, period.start_date)

		return days === 1 ? 'Commence demain' : `Commence dans ${days} j`
	}

	if (status === 'ongoing') {
		const days = daysBetween(today, period.end_date)

		if (days === 0) return 'Dernier jour'

		return days === 1 ? 'Se termine demain' : `Se termine dans ${days} j`
	}

	return `Terminée le ${formatDate(period.end_date)}`
}

export function isProvisional({ end_date }: Period, today = getToday()) {
	return daysBetween(end_date, today) === 1
}
