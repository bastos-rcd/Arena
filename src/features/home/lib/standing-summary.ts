import type { CompetitionType } from '@/features/competitions/lib/competition'
import {
	formatDelta,
	formatScore,
} from '@/features/competitions/lib/competition-format'
import type { CompetitionStanding } from '@/features/home/lib/use-dashboard'

export type StandingSummary = {
	rank: number | null
	score: number | null
	message: string
}

type Ranked = {
	userId: string
	rank: number
	score: number
}

export function summarizeStanding(
	type: CompetitionType,
	rows: CompetitionStanding[],
	userId: string,
): StandingSummary {
	const ranked = rows.flatMap(({ user_id, rank, score }) =>
		rank !== null && score !== null ? [{ userId: user_id, rank, score }] : [],
	)

	const mine = ranked.find((row) => row.userId === userId)

	if (!mine) {
		return {
			rank: null,
			score: null,
			message: "Aucune activité qui compte pour l'instant",
		}
	}

	const others = ranked.filter((row) => row.userId !== userId)
	const best = others.reduce<Ranked | undefined>(
		(current, row) => (!current || row.rank < current.rank ? row : current),
		undefined,
	)

	if (!best) {
		return {
			rank: mine.rank,
			score: mine.score,
			message: "Seul classé pour l'instant",
		}
	}

	if (mine.rank === 1) {
		return {
			rank: mine.rank,
			score: mine.score,
			message:
				best.rank === 1
					? 'À égalité en tête'
					: `En tête · ${formatDelta(type, Math.abs(mine.score - best.score))} d'avance`,
		}
	}

	const leader = ranked.find((row) => row.rank === 1) ?? best

	return {
		rank: mine.rank,
		score: mine.score,
		message: `À ${formatDelta(type, Math.abs(leader.score - mine.score))} du 1er`,
	}
}

export function formatSummaryScore(
	type: CompetitionType,
	summary: StandingSummary,
) {
	return summary.score === null ? '–' : formatScore(type, summary.score)
}
