import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'
import Link from '@/components/ui/link'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'
import { validateEmail } from '@/features/auth/lib/validation'

import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState<boolean>(false)
	const [sent, setSent] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const email = String(data.get('email')).trim()

		const nextError = validateEmail(email)

		if (nextError) {
			setError(nextError)
			return
		}

		setError(undefined)
		setLoading(true)

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		})

		if (error) setError(getAuthErrorMessage(error))
		else setSent(true)

		setLoading(false)
	}

	return (
		<>
			<h1 className="text-center text-2xl font-semibold">
				Mot de passe oublié
			</h1>

			{sent ? (
				<p className="text-mist text-center text-sm">
					Si un compte existe avec cet email, un lien aura été envoyé pour
					choisir un nouveau mot de passe.
				</p>
			) : (
				<form
					onSubmit={handleSubmit}
					noValidate
					className="flex flex-col gap-4"
				>
					<Field
						label="Email"
						error={error}
						name="email"
						type="email"
						inputMode="email"
						autoComplete="email"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
					/>

					<Button type="submit" loading={loading}>
						Envoyer le lien
					</Button>
				</form>
			)}

			<Link to="/auth" variant="accent" className="text-center">
				Retour à la connexion
			</Link>
		</>
	)
}
