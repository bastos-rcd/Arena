import type { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError) {
	switch (error.code) {
		case 'invalid_credentials':
			return 'Email ou mot de passe incorrect'
		case 'email_not_confirmed':
			return 'Confirme ton email avant de te connecter'
		case 'user_already_exists':
		case 'email_exists':
			return 'Un compte existe déjà avec cet email'
		case 'weak_password':
			return 'Mot de passe trop faible'
		case 'over_request_rate_limit':
		case 'over_email_send_rate_limit':
			return 'Trop de tentatives, réessaie dans quelques minutes'
		case 'unexpected_failure':
			return 'Inscription impossible, vérifie ton pseudo et réessaie'
		case 'same_password':
			return "Choisis un mot de passe différent de l'actuel"
		default:
			return 'Une erreur est survenue, réessaie'
	}
}
