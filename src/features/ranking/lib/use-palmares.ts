import { useEffect, useState } from 'react'

import type { PalmaresRow } from '@/features/ranking/lib/palmares'

import { supabase } from '@/lib/supabase'

export function usePalmares(userId: string) {
	const [rows, setRows] = useState<PalmaresRow[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false

		setLoading(true)

		supabase
			.rpc('get_user_palmares', { p_user_id: userId })
			.then(({ data }) => {
				if (cancelled) return
				setRows((data as PalmaresRow[] | null) ?? [])
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [userId])

	return { rows, loading }
}
