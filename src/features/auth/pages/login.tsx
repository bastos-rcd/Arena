import { useState, type SubmitEvent } from 'react'
import { useLocation } from 'react-router'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Link from '@/components/ui/link'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'

import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/validation'

type Errors = {
	email?: string
	password?: string
	form?: string
}

export default function LoginPage() {
	const location = useLocation()

	const [errors, setErrors] = useState<Errors>({})
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()

		const data = new FormData(event.currentTarget)
		const email = String(data.get('email')).trim()
		const password = String(data.get('password'))

		const nextErrors: Errors = {
			email: validateEmail(email),
			password: password ? undefined : 'Entre ton mot de passe',
		}

		if (nextErrors.email || nextErrors.password) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setSubmitting(true)

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) setErrors({ form: getAuthErrorMessage(error) })
		setSubmitting(false)
	}

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">Connexion</h1>

			<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
				<Field
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					autoCapitalize="none"
					autoCorrect="off"
					spellCheck={false}
					error={errors.email}
				/>

				<Field
					label="Mot de passe"
					name="password"
					type="password"
					autoComplete="current-password"
					error={errors.password}
				/>

				<Link to="/forgot-password" variant="muted">
					Mot de passe oublié ?
				</Link>

				{errors.form && (
					<p role="alert" className="text-error text-center text-sm">
						{errors.form}
					</p>
				)}

				<Button type="submit" disabled={submitting}>
					{submitting ? 'Connexion…' : 'Se connecter'}
				</Button>
			</form>

			<p className="text-mist text-center text-sm">
				Pas encore de compte ?{' '}
				<Link to="/register" state={location.state}>
					Créer un compte
				</Link>
			</p>
		</>
	)
}
