import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Select from '@/components/ui/select'

import DurationField from '@/features/activities/components/duration-field'
import PhotoField from '@/features/activities/components/photo-field'
import type { Activity } from '@/features/activities/lib/activity'
import { DEFAULT_NAMES } from '@/features/activities/lib/activity-config'
import { toSeconds } from '@/features/activities/lib/activity-duration'
import { getActivityErrorMessage } from '@/features/activities/lib/activity-errors'
import {
	getActivityPhotoUrl,
	removeActivityPhoto,
	uploadActivityPhoto,
} from '@/features/activities/lib/activity-photo'
import {
	validateDate,
	validateDistance,
	validateDuration,
	validateElevation,
	validateName,
	validatePhoto,
	validateSteps,
} from '@/features/activities/lib/activity-validation'
import { useAuth } from '@/features/auth/lib/auth-context'
import type { Sport } from '@/features/competitions/lib/competition'
import { SPORTS } from '@/features/competitions/lib/competition-config'
import { getToday } from '@/features/competitions/lib/competition-dates'

import { supabase } from '@/lib/supabase'

type Errors = {
	sport?: string
	name?: string
	date?: string
	distance?: string
	duration?: string
	elevation?: string
	steps?: string
	photo?: string
	form?: string
}

type ActivityFormProps = {
	activity?: Activity
	onDone?: () => void | Promise<void>
	onCancel?: () => void
}

export default function ActivityForm({
	activity,
	onDone,
	onCancel,
}: ActivityFormProps) {
	const navigate = useNavigate()
	const { user } = useAuth()

	const today = getToday()

	const [sport, setSport] = useState<Sport | ''>(activity?.sport ?? '')
	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!user) return

		const data = new FormData(e.currentTarget)
		const name = String(data.get('name')).trim()
		const date = String(data.get('date'))
		const distance = String(data.get('distance'))
		const hours = String(data.get('hours')).trim()
		const minutes = String(data.get('minutes')).trim()
		const seconds = String(data.get('seconds')).trim()
		const elevation = String(data.get('elevation')).trim()
		const steps = String(data.get('steps') ?? '').trim()
		const photo = data.get('photo') as File
		const hasNewPhoto = photo.size > 0

		const nextErrors: Errors = {
			sport: sport ? undefined : 'Choisir un sport',
			name: validateName(name),
			date: validateDate(date, today),
			distance: validateDistance(distance),
			duration: validateDuration(hours, minutes, seconds),
			elevation: validateElevation(elevation),
			steps: sport === 'walking' ? validateSteps(steps) : undefined,
			photo: !activity || hasNewPhoto ? validatePhoto(photo) : undefined,
		}

		if (Object.values(nextErrors).some(Boolean) || !sport) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		let photoPath = activity?.photo_path ?? ''

		if (hasNewPhoto) {
			try {
				photoPath = await uploadActivityPhoto(user.id, photo)
			} catch {
				setErrors({ form: "Impossible d'envoyer la photo, réessayer" })
				setLoading(false)
				return
			}
		}

		const values = {
			name: name || DEFAULT_NAMES[sport],
			sport,
			activity_date: date,
			distance: Number(distance),
			duration: toSeconds(hours, minutes, seconds),
			elevation_gain: Number(elevation || 0),
			steps: sport === 'walking' && steps ? Number(steps) : null,
			photo_path: photoPath,
		}

		const { error } = activity
			? await supabase.from('activities').update(values).eq('id', activity.id)
			: await supabase.from('activities').insert(values)

		if (error) {
			if (hasNewPhoto) await removeActivityPhoto(photoPath)
			setErrors({ form: getActivityErrorMessage(error) })
			setLoading(false)
			return
		}

		if (!activity) {
			navigate('/ranking', { replace: true })
			return
		}

		if (hasNewPhoto) await removeActivityPhoto(activity.photo_path)

		await onDone?.()
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Select
				label="Sport"
				error={errors.sport}
				value={sport}
				onChange={(e) => setSport(e.target.value as Sport | '')}
			>
				<option value="">Choisir un sport</option>

				{Object.entries(SPORTS).map(([id, { label }]) => (
					<option key={id} value={id}>
						{label}
					</option>
				))}
			</Select>

			<Field
				label="Nom"
				error={errors.name}
				name="name"
				maxLength={60}
				placeholder={sport ? DEFAULT_NAMES[sport] : "Nom de l'activité"}
				defaultValue={activity?.name}
			/>

			<Field
				label="Date"
				error={errors.date}
				name="date"
				type="date"
				max={today}
				defaultValue={activity?.activity_date ?? today}
			/>

			<div className="grid grid-cols-2 gap-4">
				<Field
					label="Distance (km)"
					error={errors.distance}
					name="distance"
					type="number"
					inputMode="decimal"
					step="0.01"
					min="0"
					defaultValue={activity?.distance}
				/>

				<Field
					label="Dénivelé (m)"
					error={errors.elevation}
					name="elevation"
					type="number"
					inputMode="numeric"
					step="1"
					min="0"
					placeholder="0"
					defaultValue={activity?.elevation_gain || ''}
				/>
			</div>

			<DurationField
				error={errors.duration}
				defaultSeconds={activity?.duration}
			/>

			{sport === 'walking' && (
				<Field
					label="Nombre de pas (facultatif)"
					error={errors.steps}
					name="steps"
					type="number"
					inputMode="numeric"
					step="1"
					min="0"
					defaultValue={activity?.steps ?? ''}
				/>
			)}

			<PhotoField
				label="Photo (preuve)"
				error={errors.photo}
				defaultUrl={activity && getActivityPhotoUrl(activity.photo_path)}
			/>

			{errors.form && (
				<p className="text-error text-center text-sm">{errors.form}</p>
			)}

			{activity ? (
				<div className="grid grid-cols-2 gap-2.5">
					<Button variant="secondary" disabled={loading} onClick={onCancel}>
						Annuler
					</Button>

					<Button type="submit" loading={loading}>
						Enregistrer
					</Button>
				</div>
			) : (
				<Button type="submit" loading={loading}>
					Ajouter l'activité
				</Button>
			)}
		</form>
	)
}
