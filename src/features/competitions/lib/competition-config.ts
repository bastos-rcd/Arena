import { Bike, Footprints, SportShoe, type LucideIcon } from 'lucide-react'

import type {
	CompetitionType,
	Sport,
} from '@/features/competitions/lib/competition'

type SportConfig = {
	label: string
	icon: LucideIcon
	types: CompetitionType[]
}

type TypeConfig = {
	label: string
	description: string
	unit: string
}

export const SPORTS: Record<Sport, SportConfig> = {
	running: {
		label: 'Course à pied',
		icon: SportShoe,
		types: [
			'total_distance',
			'longest_distance',
			'activity_count',
			'best_time',
			'total_elevation',
			'best_elevation',
		],
	},
	cycling: {
		label: 'Vélo',
		icon: Bike,
		types: [
			'total_distance',
			'longest_distance',
			'activity_count',
			'total_elevation',
			'best_elevation',
		],
	},
	walking: {
		label: 'Marche / Trail / Randonnée',
		icon: Footprints,
		types: [
			'total_steps',
			'total_distance',
			'longest_distance',
			'total_elevation',
			'best_elevation',
		],
	},
}

export const TYPES: Record<CompetitionType, TypeConfig> = {
	total_distance: {
		label: 'Distance totale',
		description: 'Distance totale effectuée sur la période',
		unit: 'km',
	},
	longest_distance: {
		label: 'Plus longue sortie',
		description: 'Plus longue sortie effectuée sur la période',
		unit: 'km',
	},
	activity_count: {
		label: 'Nombre de sorties',
		description: 'Nombre de sorties totales sur la période',
		unit: 'sorties',
	},
	best_time: {
		label: 'Meilleur temps',
		description: 'Meilleur temps sur une distance définie pour la période',
		unit: 'min',
	},
	total_elevation: {
		label: 'Dénivelé total',
		description: 'Dénivelé positif total effectué sur la période',
		unit: 'm',
	},
	best_elevation: {
		label: 'Meilleur dénivelé',
		description:
			'Meilleur dénivelé positif effectué sur la période en une activité',
		unit: 'm',
	},
	total_steps: {
		label: 'Nombre de pas',
		description: 'Nombre de pas total sur la période',
		unit: 'pas',
	},
}
