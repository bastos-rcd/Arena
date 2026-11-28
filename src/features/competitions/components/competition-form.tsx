import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Select from '@/components/ui/select'
import TextArea from '@/components/ui/text-area'

import type {
	CompetitionType,
	Sport,
} from '@/features/competitions/lib/competition'
import { SPORTS, TYPES } from '@/features/competitions/lib/competition-config'
import {
	addDays,
	getToday,
} from '@/features/competitions/lib/competition-dates'
import { getCompetitionErrorMessage } from '@/features/competitions/lib/competition-errors'
import {
	validateDescription,
	validateEndDate,
	validateName,
	validateStartDate,
	validateTargetDistance,
} from '@/features/competitions/lib/competition-validation'

import { supabase } from '@/lib/supabase'

type Errors = {
	name?: string
	description?: string
	sport?: string
	type?: string
	targetDistance?: string
	startDate?: string
	endDate?: string
	form?: string
}

export default function CompetitionForm() {
	const navigate = useNavigate()

	const today = getToday()

	const [sport, setSport] = useState<Sport | ''>('')
	const [type, setType] = useState<CompetitionType | ''>('')
	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSportChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSport(e.target.value as Sport | '')
		setType('')
	}

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const name = String(data.get('name')).trim()
		const description = String(data.get('description')).trim()
		const startDate = String(data.get('startDate'))
		const endDate = String(data.get('endDate'))
		const targetDistance = String(data.get('targetDistance') ?? '')

		const nextErrors: Errors = {
			name: validateName(name),
			description: validateDescription(description),
			sport: sport ? undefined : 'Choisir un sport',
			type: type ? undefined : 'Choisir un type',
			targetDistance:
				type === 'best_time'
					? validateTargetDistance(targetDistance)
					: undefined,
			startDate: validateStartDate(startDate, today),
			endDate: validateEndDate(endDate, startDate),
		}

		if (Object.values(nextErrors).some(Boolean) || !sport || !type) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		const { data: created, error } = await supabase
			.from('competitions')
			.insert({
				name,
				description: description || null,
				sport,
				type,
				target_distance: type === 'best_time' ? Number(targetDistance) : null,
				start_date: startDate,
				end_date: endDate,
			})
			.select('id')
			.single<{ id: string }>()

		if (error) {
			setErrors({ form: getCompetitionErrorMessage(error) })
			setLoading(false)
			return
		}

		navigate(`/competitions/${created.id}`, { replace: true })
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Field label="Nom" error={errors.name} name="name" maxLength={60} />

			<TextArea
				label="Description (facultatif)"
				error={errors.description}
				name="description"
				rows={3}
				maxLength={500}
			/>

			<Select
				label="Sport"
				error={errors.sport}
				value={sport}
				onChange={handleSportChange}
			>
				<option value="">Choisir un sport</option>

				{Object.entries(SPORTS).map(([id, { label }]) => (
					<option key={id} value={id}>
						{label}
					</option>
				))}
			</Select>

			<div className="flex flex-col gap-1.5">
				<Select
					label="Type de classement"
					error={errors.type}
					value={type}
					disabled={!sport}
					onChange={(e) => setType(e.target.value as CompetitionType | '')}
				>
					<option value="">Choisir un type</option>

					{sport &&
						SPORTS[sport].types.map((id) => (
							<option key={id} value={id}>
								{TYPES[id].label}
							</option>
						))}
				</Select>

				{type && !errors.type && (
					<p className="text-mist text-sm">{TYPES[type].description}</p>
				)}
			</div>

			{type === 'best_time' && (
				<Field
					label="Distance de référence (km)"
					error={errors.targetDistance}
					name="targetDistance"
					type="number"
					inputMode="decimal"
					step="0.01"
					min="0"
				/>
			)}

			<div className="grid grid-cols-2 gap-4">
				<Field
					label="Début"
					error={errors.startDate}
					name="startDate"
					type="date"
					min={today}
					defaultValue={today}
				/>

				<Field
					label="Fin"
					error={errors.endDate}
					name="endDate"
					type="date"
					min={today}
					defaultValue={addDays(today, 7)}
				/>
			</div>

			<p className="text-mist text-sm">
				Le sport et le type ne pourront plus être modifiés après la création.
			</p>

			{errors.form && (
				<p className="text-error text-center text-sm">{errors.form}</p>
			)}

			<Button type="submit" loading={loading}>
				Créer la compétition
			</Button>
		</form>
	)
}
