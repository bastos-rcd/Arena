import { createContext, useContext } from 'react'

export type FriendProfile = {
	id: string
	username: string
	display_name: string
	avatar_path: string | null
}

export type FriendshipItem = {
	id: string
	profile: FriendProfile
}

export type Relation =
	| { status: 'none' }
	| { status: 'friends' | 'sent' | 'received'; friendshipId: string }

type ActionResult = Promise<{ error: unknown }>

export const FriendshipsContext = createContext<{
	friends: FriendshipItem[]
	received: FriendshipItem[]
	sent: FriendshipItem[]
	loading: boolean
	getRelation: (userId: string) => Relation
	sendRequest: (userId: string) => ActionResult
	acceptRequest: (friendshipId: string) => ActionResult
	removeFriendship: (friendshipId: string) => ActionResult
} | null>(null)

export function useFriendships() {
	const context = useContext(FriendshipsContext)

	if (!context) {
		throw new Error('useFriendships must be used within a FriendshipsProvider')
	}

	return context
}
