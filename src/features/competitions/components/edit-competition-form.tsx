import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import TextArea from '@/components/ui/text-area'

import type { Competition } from '@/features/competitions/lib/competition'
import {
	addDays,
	getStatus,
	getToday,
} from '@/features/competitions/lib/competition-dates'
import { getCompetitionErrorMessage } from '@/features/competitions/lib/competition-errors'
import {
	validateDescription,
	validateEndDate,
	validateName,
	validateStartDate,
} from '@/features/competitions/lib/competition-validation'
import type { useCompetition } from '@/features/competitions/lib/use-competition'

type Errors = {
	name?: string
	description?: string
	startDate?: string
	endDate?: string
	form?: string
}

type EditCompetitionFormProps = {
	competition: Competition
	onSave: ReturnType<typeof useCompetition>['update']
	onDone: () => void
}

export default function EditCompetitionForm({
	competition,
	onSave,
	onDone,
}: EditCompetitionFormProps) {
	const today = getToday()
	const canEditStart = getStatus(competition, today) === 'upcoming'

	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const name = String(data.get('name')).trim()
		const description = String(data.get('description')).trim()
		const endDate = String(data.get('endDate'))
		const startDate = canEditStart
			? String(data.get('startDate'))
			: competition.start_date

		const startChanged = startDate !== competition.start_date
		const endChanged = endDate !== competition.end_date

		const nextErrors: Errors = {
			name: validateName(name),
			description: validateDescription(description),
			startDate: startChanged ? validateStartDate(startDate, today) : undefined,
			endDate: validateEndDate(
				endDate,
				startDate,
				endChanged ? addDays(today, 1) : undefined,
			),
		}

		if (Object.values(nextErrors).some(Boolean)) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		const { error } = await onSave({
			name,
			description: description || null,
			start_date: startDate,
			end_date: endDate,
		})

		if (error) {
			setErrors({ form: getCompetitionErrorMessage(error) })
			setLoading(false)
			return
		}

		onDone()
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Field
				label="Nom"
				error={errors.name}
				name="name"
				maxLength={60}
				defaultValue={competition.name}
			/>

			<TextArea
				label="Description (facultatif)"
				error={errors.description}
				name="description"
				rows={3}
				maxLength={500}
				defaultValue={competition.description ?? ''}
			/>

			<div className="grid grid-cols-2 gap-4">
				<Field
					label="Début"
					error={errors.startDate}
					name="startDate"
					type="date"
					min={today}
					disabled={!canEditStart}
					defaultValue={competition.start_date}
				/>

				<Field
					label="Fin"
					error={errors.endDate}
					name="endDate"
					type="date"
					min={addDays(today, 1)}
					defaultValue={competition.end_date}
				/>
			</div>

			{!canEditStart && (
				<p className="text-mist text-sm">
					La date de début ne peut plus être modifiée une fois la compétition
					commencée.
				</p>
			)}

			{errors.form && (
				<p className="text-error text-center text-sm">{errors.form}</p>
			)}

			<Button type="submit" loading={loading}>
				Enregistrer
			</Button>
		</form>
	)
}
