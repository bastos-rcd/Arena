import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Link from '@/components/ui/link'

import { useAuth } from '@/features/auth/lib/auth-context'
import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'

import { supabase } from '@/lib/supabase'
import { validatePassword } from '@/lib/validation'

type Errors = {
	password?: string
	confirm?: string
	form?: string
}

export default function ResetPasswordPage() {
	const { session, loading } = useAuth()
	const navigate = useNavigate()

	const [errors, setErrors] = useState<Errors>({})
	const [submitting, setSubmitting] = useState(false)

	if (loading) return null

	if (!session) {
		return (
			<>
				<p className="text-mist text-center">
					Ce lien est invalide ou a expiré.
				</p>
				<Link to="/forgot-password" className="text-center">
					Demander un nouveau lien
				</Link>
			</>
		)
	}

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()

		const data = new FormData(event.currentTarget)
		const password = String(data.get('password'))
		const confirm = String(data.get('confirm'))

		const nextErrors: Errors = {
			password: validatePassword(password),
			confirm: password === confirm ? undefined : 'Les mots de passe diffèrent',
		}

		if (nextErrors.password || nextErrors.confirm) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setSubmitting(true)

		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			setErrors({ form: getAuthErrorMessage(error) })
			setSubmitting(false)
			return
		}

		navigate('/', { replace: true })
	}

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">
				Nouveau mot de passe
			</h1>

			<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
				<Field
					label="Nouveau mot de passe"
					name="password"
					type="password"
					autoComplete="new-password"
					error={errors.password}
				/>

				<Field
					label="Confirmer le mot de passe"
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
					{submitting ? 'Enregistrement…' : 'Enregistrer'}
				</Button>
			</form>
		</>
	)
}
