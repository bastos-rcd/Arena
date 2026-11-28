import { useState } from 'react'

export function useAction() {
	const [loading, setLoading] = useState<boolean>(false)

	const run = async (action: () => Promise<{ error: unknown }>) => {
		setLoading(true)

		const { error } = await action()

		if (error) alert('Une erreur est survenue, réessayer')

		setLoading(false)
	}

	return { loading, run }
}
