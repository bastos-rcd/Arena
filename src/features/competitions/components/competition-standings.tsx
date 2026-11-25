import StandingCard from '@/features/competitions/components/standing-card'
import type { Competition } from '@/features/competitions/lib/competition'
import { isProvisional } from '@/features/competitions/lib/competition-dates'
import type { Standing } from '@/features/competitions/lib/use-competition-results'
import Section from '@/features/friends/components/section'
import type { Profile } from '@/features/profile/lib/use-profile'

type CompetitionStandingsProps = {
	competition: Competition
	standings: Standing[]
	participants: Profile[]
	userId?: string
}

export default function CompetitionStandings({
	competition,
	standings,
	participants,
	userId,
}: CompetitionStandingsProps) {
	const profiles = new Map(participants.map((profile) => [profile.id, profile]))

	const rows = standings
		.flatMap((standing) => {
			const profile = profiles.get(standing.user_id)

			return profile ? [{ standing, profile }] : []
		})
		.toSorted(
			(a, b) =>
				(a.standing.rank ?? Infinity) - (b.standing.rank ?? Infinity) ||
				a.profile.full_name.localeCompare(b.profile.full_name),
		)

	const leaderScore =
		rows.find(({ standing }) => standing.rank === 1)?.standing.score ?? null

	return (
		<Section title="Classement">
			{isProvisional(competition) && (
				<p className="text-mist text-sm">
					Résultats provisoires : les activités peuvent encore être modifiées
					aujourd'hui.
				</p>
			)}

			{leaderScore === null && (
				<p className="text-mist text-sm">Aucun résultat pour l'instant</p>
			)}

			{rows.map(({ standing, profile }) => (
				<StandingCard
					key={profile.id}
					profile={profile}
					standing={standing}
					type={competition.type}
					leaderScore={leaderScore}
					isCurrentUser={profile.id === userId}
				/>
			))}
		</Section>
	)
}
