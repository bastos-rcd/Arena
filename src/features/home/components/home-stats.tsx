import Stat from '@/components/ui/stat'

import Section from '@/features/friends/components/section'

type HomeStatsProps = {
	ongoing: number
	upcoming: number
	leading: number
	weekCount: number
}

export default function HomeStats({
	ongoing,
	upcoming,
	leading,
	weekCount,
}: HomeStatsProps) {
	return (
		<Section title="Aperçu">
			<div className="grid grid-cols-2 gap-2.5">
				<Stat label="En cours" value={String(ongoing)} />
				<Stat label="À venir" value={String(upcoming)} />
				<Stat label="En tête" value={String(leading)} />
				<Stat label="Activités (7 j)" value={String(weekCount)} />
			</div>
		</Section>
	)
}
