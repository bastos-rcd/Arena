export function validateName(value: string) {
	if (!value) return 'Entrer un nom'
	if (value.length < 3 || value.length > 60) return 'Entre 3 et 60 caractères'
}

export function validateDescription(value: string) {
	if (value.length > 500) return '500 caractères maximum'
}

export function validateStartDate(value: string, today: string) {
	if (!value) return 'Choisir une date de début'
	if (value < today) return 'La date de début est déjà passée'
}

export function validateEndDate(value: string, start: string, min?: string) {
	if (!value) return 'Choisir une date de fin'
	if (start && value < start) return 'La fin doit être après le début'
	if (min && value < min) return "La fin doit être après aujourd'hui"
}

export function validateTargetDistance(value: string) {
	const distance = Number(value)

	if (!value || !Number.isFinite(distance) || distance <= 0)
		return 'Entrer une distance valide'
	if (distance > 9999) return '9999 km maximum'
}
