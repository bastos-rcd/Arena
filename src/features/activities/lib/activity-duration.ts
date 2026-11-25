export function toSeconds(hours: string, minutes: string, seconds: string) {
	return (
		Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)
	)
}
