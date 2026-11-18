import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'

import Field from '@/components/field'

import { supabase } from '@/lib/supabase'
import {
	validateDisplayName,
	validateEmail,
	validatePassword,
	validateUsername,
} from '@/lib/validation'
import { getAuthErrorMessage } from '@/lib/auth/auth-errors'

type Errors = {
	email?: string
	username?: string
	displayName?: string
	password?: string
	form?: string
}

export default function RegisterPage() {
	const [errors, setErrors] = useState<Errors>({})
	const [submitting, setSubmitting] = useState(false)
	const [confirmationSent, setConfirmationSent] = useState(false)

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()

		const data = new FormData(event.currentTarget)
		const email = String(data.get('email')).trim()
		const username = String(data.get('username')).trim()
		const displayName = String(data.get('displayName')).trim()
		const password = String(data.get('password'))

		const nextErrors: Errors = {
			email: validateEmail(email),
			username: validateUsername(username),
			displayName: validateDisplayName(displayName),
			password: validatePassword(password),
		}

		if (Object.values(nextErrors).some(Boolean)) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setSubmitting(true)

		const { data: available, error: availabilityError } = await supabase.rpc(
			'is_username_available',
			{ p_username: username },
		)

		if (availabilityError) {
			setErrors({ form: 'Une erreur est survenue, réessaie' })
			setSubmitting(false)
			return
		}

		if (!available) {
			setErrors({ username: 'Ce pseudo est déjà pris' })
			setSubmitting(false)
			return
		}

		const { data: result, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username, display_name: displayName } },
		})

		if (error) {
			setErrors({ form: getAuthErrorMessage(error) })
		} else if (result.user?.identities?.length === 0) {
			setErrors({ email: 'Un compte existe déjà avec cet email' })
		} else if (!result.session) {
			setConfirmationSent(true)
		}

		setSubmitting(false)
	}

	if (confirmationSent) {
		return (
			<div className="flex flex-col gap-5 text-center">
				<h1 className="text-2xl font-semibold">Vérifie tes emails</h1>
				<p className="text-mist">
					Nous t'avons envoyé un lien pour confirmer ton compte. Ouvre-le, puis
					connecte-toi.
				</p>

				<Link to="/login" className="text-volt font-medium">
					Aller à la connexion
				</Link>
			</div>
		)
	}

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">Créer un compte</h1>

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
					label="Pseudo"
					name="username"
					autoComplete="username"
					autoCapitalize="none"
					autoCorrect="off"
					spellCheck={false}
					maxLength={20}
					error={errors.username}
				/>

				<Field
					label="Nom affiché"
					name="displayName"
					autoComplete="name"
					maxLength={40}
					error={errors.displayName}
				/>

				<Field
					label="Mot de passe"
					name="password"
					type="password"
					autoComplete="new-password"
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
					className="bg-volt text-ink rounded-xl py-3 font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
				>
					{submitting ? 'Création…' : 'Créer mon compte'}
				</button>
			</form>

			<p className="text-mist text-center text-sm">
				Déjà un compte ?{' '}
				<Link to="/login" className="text-volt font-medium">
					Se connecter
				</Link>
			</p>
		</>
	)
}
