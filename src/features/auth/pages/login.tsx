import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'

import Field from '@/components/ui/field'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'

import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/validation'

type Errors = {
	email?: string
	password?: string
	form?: string
}

export default function LoginPage() {
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

				{errors.form && (
					<p role="alert" className="text-error text-center text-sm">
						{errors.form}
					</p>
				)}

				<button
					type="submit"
					disabled={submitting}
					className="bg-volt text-ink rounded-xl p-2.5 font-semibold transition-transform active:scale-95 disabled:opacity-50"
				>
					{submitting ? 'Connexion…' : 'Se connecter'}
				</button>
			</form>

			<p className="text-mist text-center text-sm">
				Pas encore de compte ?{' '}
				<Link to="/register" className="text-volt font-medium">
					Créer un compte
				</Link>
			</p>
		</>
	)
}
