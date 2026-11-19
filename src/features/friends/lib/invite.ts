export type InviteResult = 'shared' | 'copied' | 'cancelled'

export function getInviteUrl(username: string) {
	return `${window.location.origin}/u/${username}`
}

export async function shareInvite(username: string): Promise<InviteResult> {
	const url = getInviteUrl(username)

	if (navigator.share) {
		try {
			await navigator.share({
				title: 'Arena',
				text: 'Rejoins-moi sur Arena !',
				url,
			})
			return 'shared'
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				return 'cancelled'
			}
		}
	}

	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(url)
			return 'copied'
		} catch {}
	}

	window.prompt('Copie ce lien pour inviter tes amis', url)
	return 'shared'
}
