type ErrorLike = {
	message?: string
}

export function getActivityErrorMessage(error: ErrorLike) {
	switch (error.message) {
		case 'activity_locked':
			return 'Activité verrouillée : une compétition où elle compte est terminée depuis plus d’un jour'
		case 'activity_date_in_future':
			return 'La date ne peut pas être dans le futur'
		default:
			return 'Une erreur est survenue, réessayer'
	}
}
