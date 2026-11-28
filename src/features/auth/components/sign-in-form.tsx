import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'
import { validateEmail, validatePassword } from '@/features/auth/lib/validation'

import { supabase } from '@/lib/supabase'

type Errors = {
	email?: string
	password?: string
	form?: string
}

export default function SignInForm() {
	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const email = String(data.get('email')).trim()
		const password = String(data.get('password'))

		const nextErrors: Errors = {
			email: validateEmail(email),
			password: validatePassword(password),
		}

		if (Object.values(nextErrors).some(Boolean)) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) setErrors({ form: getAuthErrorMessage(error) })
		setLoading(false)
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Field
				label="Email"
				error={errors.email}
				name="email"
				type="email"
				inputMode="email"
				autoComplete="email"
				autoCapitalize="none"
				autoCorrect="off"
				spellCheck={false}
			/>

			<Field
				label="Mot de passe"
				error={errors.password}
				name="password"
				type="password"
				autoComplete="current-password"
			/>

			{errors.form && (
				<p className="text-error text-center text-sm">{errors.form}</p>
			)}

			<Button type="submit" loading={loading}>
				Se connecter
			</Button>
		</form>
	)
}
