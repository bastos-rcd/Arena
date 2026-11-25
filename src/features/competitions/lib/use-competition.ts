import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/lib/auth-context'
import {
	COMPETITION_COLUMNS,
	type Competition,
} from '@/features/competitions/lib/competition'
import {
	PROFILE_COLUMNS,
	type Profile,
} from '@/features/profile/lib/use-profile'

import { supabase } from '@/lib/supabase'

type ParticipantRow = {
	created_at: string
	profile: Profile
}

type CompetitionRow = Competition & {
	participants: ParticipantRow[]
}

export type CompetitionChanges = Partial<
	Pick<Competition, 'name' | 'description' | 'start_date' | 'end_date'>
>

const fetchCompetition = (id: string) =>
	supabase
		.from('competitions')
		.select(
			`${COMPETITION_COLUMNS}, participants:competition_participants(created_at, profile:profiles(${PROFILE_COLUMNS}))`,
		)
		.eq('id', id)
		.maybeSingle<CompetitionRow>()

const sortParticipants = (rows: ParticipantRow[], ownerId: string) =>
	rows
		.toSorted(
			(a, b) =>
				Number(b.profile.id === ownerId) - Number(a.profile.id === ownerId) ||
				a.created_at.localeCompare(b.created_at),
		)
		.map(({ profile }) => profile)

export function useCompetition(id: string) {
	const { user } = useAuth()
	const userId = user?.id

	const [competition, setCompetition] = useState<Competition | null>(null)
	const [participants, setParticipants] = useState<Profile[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	const apply = (row: CompetitionRow | null) => {
		if (!row) {
			setCompetition(null)
			setParticipants([])
			return
		}

		const { participants: rows, ...rest } = row

		setCompetition(rest)
		setParticipants(sortParticipants(rows, rest.owner_id))
	}

	useEffect(() => {
		let cancelled = false

		setLoading(true)

		fetchCompetition(id).then(({ data }) => {
			if (cancelled) return
			apply(data)
			setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [id])

	const reload = async () => {
		const { data } = await fetchCompetition(id)
		apply(data)
	}

	const update = async (changes: CompetitionChanges) => {
		const { error } = await supabase
			.from('competitions')
			.update(changes)
			.eq('id', id)

		if (!error) await reload()

		return { error }
	}

	const remove = () => supabase.from('competitions').delete().eq('id', id)

	const addParticipant = async (participantId: string) => {
		const { error } = await supabase
			.from('competition_participants')
			.insert({ competition_id: id, user_id: participantId })

		await reload()

		return { error }
	}

	const removeParticipant = async (participantId: string) => {
		const { error } = await supabase
			.from('competition_participants')
			.delete()
			.eq('competition_id', id)
			.eq('user_id', participantId)

		await reload()

		return { error }
	}

	const leave = () =>
		supabase
			.from('competition_participants')
			.delete()
			.eq('competition_id', id)
			.eq('user_id', userId ?? '')

	return {
		competition,
		participants,
		loading,
		update,
		remove,
		addParticipant,
		removeParticipant,
		leave,
	}
}
