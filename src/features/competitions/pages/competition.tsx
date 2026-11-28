import { Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import Button from '@/components/ui/button'
import Return from '@/components/ui/return'

import { useAuth } from '@/features/auth/lib/auth-context'
import AddParticipantCard from '@/features/competitions/components/add-participant-card'
import CompetitionActivities from '@/features/competitions/components/competition-activities'
import CompetitionHeader from '@/features/competitions/components/competition-header'
import CompetitionProgress from '@/features/competitions/components/competition-progress'
import CompetitionStandings from '@/features/competitions/components/competition-standings'
import CompetitionStats from '@/features/competitions/components/competition-stats'
import EditCompetitionForm from '@/features/competitions/components/edit-competition-form'
import ParticipantCard from '@/features/competitions/components/participant-card'
import { getStatus } from '@/features/competitions/lib/competition-dates'
import { useCompetition } from '@/features/competitions/lib/use-competition'
import { useCompetitionResults } from '@/features/competitions/lib/use-competition-results'
import Section from '@/features/friends/components/section'
import { useAction } from '@/features/friends/lib/use-action'
import { useFriendships } from '@/features/friends/lib/use-friendships'

export default function CompetitionPage() {
	const { id = '' } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()

	const {
		competition,
		participants,
		loading,
		update,
		remove,
		addParticipant,
		removeParticipant,
		leave,
	} = useCompetition(id)
	const { friends, loading: friendsLoading } = useFriendships()
	const {
		standings,
		activities,
		loading: resultsLoading,
	} = useCompetitionResults(id, participants)

	const [editing, setEditing] = useState<boolean>(false)

	const deleting = useAction()
	const leaving = useAction()

	if (loading || friendsLoading || (competition && resultsLoading)) return null

	if (!competition) {
		return (
			<div className="flex flex-col gap-8">
				<Return to="/" label="Accueil" />

				<p className="text-mist text-center">Compétition introuvable</p>
			</div>
		)
	}

	const isOwner = competition.owner_id === user?.id
	const status = getStatus(competition)
	const finished = status === 'finished'

	const participantIds = new Set(participants.map(({ id }) => id))
	const invitable = friends.filter(
		({ profile }) => !participantIds.has(profile.id),
	)

	const handleDelete = () => {
		if (
			!window.confirm(
				'Supprimer définitivement cette compétition ? Cette action est irréversible.',
			)
		)
			return

		deleting.run(async () => {
			const { error } = await remove()
			if (!error) navigate('/', { replace: true })
			return { error }
		})
	}

	const handleLeave = () => {
		if (!window.confirm('Quitter cette compétition ?')) return

		leaving.run(async () => {
			const { error } = await leave()
			if (!error) navigate('/', { replace: true })
			return { error }
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<Return
					to={finished ? '/ranking' : '/'}
					label={finished ? 'Classement' : 'Accueil'}
				/>

				{isOwner && (
					<Button
						variant="secondary"
						aria-label={
							editing ? 'Annuler la modification' : 'Modifier la compétition'
						}
						className="size-10"
						onClick={() => setEditing(!editing)}
					>
						{editing ? <X size={20} /> : <Pencil size={20} />}
					</Button>
				)}
			</div>

			{editing ? (
				<EditCompetitionForm
					competition={competition}
					onSave={update}
					onDone={() => setEditing(false)}
				/>
			) : (
				<CompetitionHeader competition={competition} />
			)}

			{status === 'ongoing' && (
				<CompetitionProgress competition={competition} />
			)}

			{status !== 'upcoming' && (
				<>
					<CompetitionStandings
						competition={competition}
						standings={standings}
						participants={participants}
						userId={user?.id}
					/>

					<CompetitionStats sport={competition.sport} activities={activities} />

					<CompetitionActivities
						activities={activities}
						participants={participants}
					/>
				</>
			)}

			<Section title={`Participants · ${participants.length}`}>
				{participants.map((profile) => (
					<ParticipantCard
						key={profile.id}
						profile={profile}
						isOrganizer={profile.id === competition.owner_id}
						canRemove={isOwner && !finished}
						onRemove={removeParticipant}
					/>
				))}
			</Section>

			{isOwner && !finished && (
				<Section title="Ajouter des amis">
					{invitable.length === 0 && (
						<p className="text-mist text-sm">
							Tous tes amis participent déjà à cette compétition
						</p>
					)}

					{invitable.map(({ profile }) => (
						<AddParticipantCard
							key={profile.id}
							profile={profile}
							onAdd={addParticipant}
						/>
					))}
				</Section>
			)}

			{!finished && isOwner && (
				<Button
					variant="danger"
					loading={deleting.loading}
					onClick={handleDelete}
				>
					Supprimer la compétition
				</Button>
			)}

			{!finished && !isOwner && (
				<Button
					variant="danger"
					loading={leaving.loading}
					onClick={handleLeave}
				>
					Quitter la compétition
				</Button>
			)}
		</div>
	)
}
