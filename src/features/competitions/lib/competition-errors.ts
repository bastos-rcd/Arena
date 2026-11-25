type ErrorLike = {
	message?: string
}

export function getCompetitionErrorMessage(error: ErrorLike) {
	switch (error.message) {
		case 'competition_start_in_past':
			return 'La date de début est déjà passée'
		case 'competition_already_started':
			return 'La date de début ne peut plus être modifiée, la compétition a commencé'
		case 'competition_end_in_past':
			return "La date de fin doit être après aujourd'hui"
		case 'competition_finished':
			return 'La compétition est terminée, elle ne peut plus être modifiée'
		default:
			return 'Une erreur est survenue, réessayer'
	}
}
