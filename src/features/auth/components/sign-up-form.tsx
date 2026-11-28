import { useState, type SubmitEvent } from 'react'

import Button from '@/components/ui/button'
import Field from '@/components/ui/field'

import { getAuthErrorMessage } from '@/features/auth/lib/auth-errors'
import {
	validateEmail,
	validateFullName,
	validatePassword,
	validateUsername,
} from '@/features/auth/lib/validation'

import { supabase } from '@/lib/supabase'

type Errors = {
	fullName?: string
	username?: string
	email?: string
	password?: string
	form?: string
}

export default function SignUpForm() {
	const [errors, setErrors] = useState<Errors>({})
	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const fullName = String(data.get('fullName')).trim()
		const username = String(data.get('username')).trim()
		const email = String(data.get('email')).trim()
		const password = String(data.get('password'))

		const nextErrors: Errors = {
			fullName: validateFullName(fullName),
			username: validateUsername(username),
			email: validateEmail(email),
			password: validatePassword(password),
		}

		if (Object.values(nextErrors).some(Boolean)) {
			setErrors(nextErrors)
			return
		}

		setErrors({})
		setLoading(true)

		const { data: available, error: availabilityError } = await supabase.rpc(
			'is_username_available',
			{ p_username: username },
		)

		if (availabilityError) {
			setErrors({ form: 'Une erreur est survenue, réessayer' })
			setLoading(false)
			return
		}

		if (!available) {
			setErrors({ username: 'Ce pseudo est déjà pris' })
			setLoading(false)
			return
		}

		const { data: result, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username, full_name: fullName } },
		})

		if (error) setErrors({ form: getAuthErrorMessage(error) })
		else if (result.user?.identities?.length === 0)
			setErrors({ email: 'Un compte existe déjà avec cet email' })
		setLoading(false)
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
			<Field
				label="Prénom et nom"
				error={errors.fullName}
				name="fullName"
				autoComplete="name"
			/>

			<Field
				label="Pseudo"
				error={errors.username}
				name="username"
				autoComplete="username"
				autoCapitalize="none"
				autoCorrect="off"
				spellCheck={false}
			/>

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
				autoComplete="new-password"
			/>

			{errors.form && (
				<p className="text-error text-center text-sm">{errors.form}</p>
			)}

			<Button type="submit" loading={loading}>
				S'inscrire
			</Button>
		</form>
	)
}
