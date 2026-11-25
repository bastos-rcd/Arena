import type { CompetitionType } from '@/features/competitions/lib/competition'
import { TYPES } from '@/features/competitions/lib/competition-config'

import { formatDuration, formatNumber } from '@/lib/format'

export function formatScore(type: CompetitionType, score: number) {
	if (type === 'best_time') return formatDuration(score)

	if (type === 'activity_count')
		return `${score} ${score > 1 ? 'sorties' : 'sortie'}`

	return `${formatNumber(score)} ${TYPES[type].unit}`
}

export function formatGap(
	type: CompetitionType,
	score: number,
	leaderScore: number,
) {
	const gap = Math.abs(leaderScore - score)

	if (type === 'best_time') return `+${formatDuration(gap)}`

	return `-${formatScore(type, gap)}`
}
