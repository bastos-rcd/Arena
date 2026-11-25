const NUMBER_FORMAT = new Intl.NumberFormat('fr-FR', {
	maximumFractionDigits: 2,
})

export function formatNumber(value: number) {
	return NUMBER_FORMAT.format(value)
}

export function formatDuration(seconds: number) {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const rest = String(seconds % 60).padStart(2, '0')

	if (hours === 0) return `${minutes}:${rest}`

	return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`
}
