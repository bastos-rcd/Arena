const EMAIL_REGEX = /^\S+@\S+\.\S+$/
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/

export const PASSWORD_MIN_LENGTH = 6

export function validateEmail(value: string) {
	if (!value) return 'Entre ton email'
	if (!EMAIL_REGEX.test(value)) return 'Email invalide'
}

export function validateUsername(value: string) {
	if (!value) return 'Choisis un pseudo'
	if (!USERNAME_REGEX.test(value)) {
		return '3 à 20 caractères : lettres, chiffres et _'
	}
}

export function validateDisplayName(value: string) {
	if (!value) return 'Entre ton nom'
	if (value.length > 40) return '40 caractères maximum'
}

export function validatePassword(value: string) {
	if (!value) return 'Entre un mot de passe'
	if (value.length < PASSWORD_MIN_LENGTH) {
		return `${PASSWORD_MIN_LENGTH} caractères minimum`
	}
}
