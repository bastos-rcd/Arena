import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Link from '@/components/ui/link'

import { useAuth } from '@/features/auth/lib/auth-context'
import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'
import { validatePassword } from '@/features/auth/lib/validation'

import { supabase } from '@/lib/supabase'

type Errors = {
	password?: string
	confirm?: string
	form?: string
}

export default function ResetPasswordPage() {
	const navigate = useNavigate()

	const { session, loading: authLoading } = useAuth()

	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const password = String(data.get('password'))
		const confirm = String(data.get('confirm'))

		const nextErrors: Errors = {
			password: validatePassword(password),
			confirm:
				password === confirm ? undefined : 'Les mots de passe sont différents',
		}

		if (Object.values(nextErrors).some(Boolean)) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			setErrors({ form: getAuthErrorMessage(error) })
			setLoading(false)
			return
		}

		await supabase.auth.signOut({ scope: 'others' })
		navigate('/', { replace: true })
	}

	if (authLoading) return null

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

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">
				Nouveau mot de passe
			</h1>

			<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
				<Field
					label="Nouveau mot de passe"
					error={errors.password}
					name="password"
					type="password"
					autoComplete="new-password"
				/>

				<Field
					label="Confirmer le mot de passe"
					error={errors.confirm}
					name="confirm"
					type="password"
					autoComplete="new-password"
				/>

				{errors.form && (
					<p className="text-error text-center text-sm">{errors.form}</p>
				)}

				<Button type="submit" loading={loading}>
					Valider
				</Button>
			</form>
		</>
	)
}
