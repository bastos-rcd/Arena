import { toSeconds } from '@/features/activities/lib/activity-duration'

export function validateName(value: string) {
	if (value.length > 60) return '60 caractères maximum'
}

export function validateDate(value: string, today: string) {
	if (!value) return 'Choisir une date'
	if (value > today) return 'La date ne peut pas être dans le futur'
}

export function validateDistance(value: string) {
	const distance = Number(value)

	if (!value || !Number.isFinite(distance) || distance < 0.01)
		return 'Entrer une distance valide'
	if (distance > 1000) return '1000 km maximum'
}

export function validateDuration(
	hours: string,
	minutes: string,
	seconds: string,
) {
	const values = [hours, minutes, seconds].map((value) => Number(value || 0))

	if (values.some((value) => !Number.isInteger(value) || value < 0))
		return 'Entrer des nombres entiers'
	if (values[1] > 59 || values[2] > 59)
		return 'Minutes et secondes entre 0 et 59'

	const total = toSeconds(hours, minutes, seconds)

	if (total < 60) return 'Au moins 1 minute'
	if (total > 172800) return '48 h maximum'
}

export function validateElevation(value: string) {
	if (!value) return

	const elevation = Number(value)

	if (!Number.isInteger(elevation) || elevation < 0)
		return 'Entrer un nombre entier'
	if (elevation > 20000) return '20000 m maximum'
}

export function validateSteps(value: string) {
	if (!value) return

	const steps = Number(value)

	if (!Number.isInteger(steps) || steps < 0) return 'Entrer un nombre entier'
	if (steps > 200000) return '200000 pas maximum'
}

export function validatePhoto(file: File) {
	if (!file.size) return 'Ajouter une photo'
	if (!file.type.startsWith('image/')) return 'Choisir une image'
}
