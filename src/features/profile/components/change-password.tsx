import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import { useAuth } from '@/features/auth/lib/auth-context'
import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'

import { supabase } from '@/lib/supabase'
import { validatePassword } from '@/lib/validation'

type Errors = {
	current?: string
	password?: string
	confirm?: string
	form?: string
}

export default function ChangePassword() {
	const { user } = useAuth()

	const [errors, setErrors] = useState<Errors>({})
	const [submitting, setSubmitting] = useState(false)
	const [done, setDone] = useState(false)

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!user?.email) return

		const form = event.currentTarget
		const data = new FormData(form)
		const current = String(data.get('current'))
		const password = String(data.get('password'))
		const confirm = String(data.get('confirm'))

		const nextErrors: Errors = {
			current: current ? undefined : 'Entre ton mot de passe actuel',
			password: validatePassword(password),
			confirm: password === confirm ? undefined : 'Les mots de passe diffèrent',
		}

		setDone(false)

		if (nextErrors.current || nextErrors.password || nextErrors.confirm) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setSubmitting(true)

		const { error: checkError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: current,
		})

		if (checkError) {
			setErrors({
				current:
					checkError.code === 'invalid_credentials'
						? 'Mot de passe actuel incorrect'
						: getAuthErrorMessage(checkError),
			})
			setSubmitting(false)
			return
		}

		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			setErrors({ form: getAuthErrorMessage(error) })
		} else {
			form.reset()
			setDone(true)
		}

		setSubmitting(false)
	}

	return (
		<form
			onSubmit={handleSubmit}
			onChange={() => setDone(false)}
			noValidate
			className="flex flex-col gap-4"
		>
			<h2 className="text-mist text-sm font-medium">Mot de passe</h2>

			<Field
				label="Mot de passe actuel"
				name="current"
				type="password"
				autoComplete="current-password"
				error={errors.current}
			/>

			<Field
				label="Nouveau mot de passe"
				name="password"
				type="password"
				autoComplete="new-password"
				error={errors.password}
			/>

			<Field
				label="Confirmer le nouveau mot de passe"
				name="confirm"
				type="password"
				autoComplete="new-password"
				error={errors.confirm}
			/>

			{errors.form && (
				<p role="alert" className="text-error text-center text-sm">
					{errors.form}
				</p>
			)}

			<Button type="submit" disabled={submitting}>
				{submitting ? 'Enregistrement…' : 'Modifier le mot de passe'}
			</Button>

			{done && (
				<p role="status" className="text-success text-center text-sm">
					Mot de passe modifié
				</p>
			)}
		</form>
	)
}
