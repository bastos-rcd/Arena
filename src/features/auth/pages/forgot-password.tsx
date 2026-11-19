import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Link from '@/components/ui/link'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'

import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/validation'

export default function ForgotPasswordPage() {
	const [error, setError] = useState<string>()
	const [submitting, setSubmitting] = useState(false)
	const [sent, setSent] = useState(false)

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()

		const email = String(new FormData(event.currentTarget).get('email')).trim()

		const emailError = validateEmail(email)
		if (emailError) {
			setError(emailError)
			return
		}

		setError(undefined)
		setSubmitting(true)

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		})

		if (error) setError(getAuthErrorMessage(error))
		else setSent(true)

		setSubmitting(false)
	}

	if (sent) {
		return (
			<>
				<h1 className="text-center text-2xl font-semibold">Email envoyé</h1>
				<p className="text-mist text-center text-sm">
					Si un compte existe avec cet email, tu vas recevoir un lien pour
					choisir un nouveau mot de passe.
				</p>
				<Link to="/login" className="text-center">
					Retour à la connexion
				</Link>
			</>
		)
	}

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">
				Mot de passe oublié
			</h1>

			<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
				<Field
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					autoCapitalize="none"
					autoCorrect="off"
					spellCheck={false}
					error={error}
				/>

				<Button type="submit" disabled={submitting}>
					{submitting ? 'Envoi…' : 'Envoyer le lien'}
				</Button>
			</form>

			<Link to="/login" variant="muted" className="text-center">
				Retour à la connexion
			</Link>
		</>
	)
}
