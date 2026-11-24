const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-z0-9_]+$/

export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
export const PASSWORD_MIN = 6

export function validateEmail(value: string) {
	if (!value) return 'Entrer un email'
	if (!EMAIL_REGEX.test(value.trim())) return 'Email invalide'
}

export function validatePassword(value: string) {
	if (!value) return 'Entrer un mot de passe'
	if (value.length < PASSWORD_MIN) return `${PASSWORD_MIN} caractères minimum`
}

export function validateUsername(value: string) {
	if (!value) return 'Choisir un pseudo'
	if (value.length < USERNAME_MIN || value.length > USERNAME_MAX)
		return `Entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères`
	if (!USERNAME_REGEX.test(value))
		return 'Uniquement des lettres minuscules, chiffres et _'
}

export function validateFullName(value: string) {
	if (!value || value.trim().length < 2) return 'Entrer un prénom et un nom'
	if (value.trim().length > 100) return '100 caractères maximum'
}
