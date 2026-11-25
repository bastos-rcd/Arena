const RANK_STYLES: Record<number, string> = {
	1: 'bg-gold text-ink',
	2: 'bg-silver text-ink',
	3: 'bg-bronze text-ink',
}

type RankBadgeProps = {
	rank: number | null
}

export default function RankBadge({ rank }: RankBadgeProps) {
	return (
		<span
			className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
				RANK_STYLES[rank ?? 0] ?? 'bg-slate text-mist'
			}`}
		>
			{rank ?? '–'}
		</span>
	)
}
