import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'

export default function HomePage() {
	const { user } = useAuth()

	return (
		<>
			<p className="text-mist">{user?.email}</p>
			<button onClick={() => supabase.auth.signOut()} className="text-volt">
				Se déconnecter
			</button>
		</>
	)
}
