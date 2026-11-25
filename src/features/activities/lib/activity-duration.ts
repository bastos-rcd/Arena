export function toSeconds(hours: string, minutes: string, seconds: string) {
	return (
		Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)
	)
}

export function splitDuration(total: number) {
	return {
		hours: Math.floor(total / 3600),
		minutes: Math.floor((total % 3600) / 60),
		seconds: total % 60,
	}
}
