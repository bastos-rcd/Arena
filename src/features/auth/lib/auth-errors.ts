import type { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError) {
	switch (error.code) {
		case 'invalid_credentials':
			return 'Email ou mot de passe incorrect'
		case 'email_not_confirmed':
			return "Confirmer l'email avant de se connecter"
		case 'user_already_exists':
		case 'email_exists':
			return 'Un compte existe déjà avec cet email'
		case 'weak_password':
			return 'Mot de passe trop faible'
		case 'same_password':
			return "Le nouveau mot de passe doit être différent de l'ancien"
		case 'over_request_rate_limit':
		case 'over_email_send_rate_limit':
			return 'Trop de tentatives, réessayer plus tard'
		default:
			return 'Une erreur est survenue, réessayer plus tard'
	}
}
