export function getRedirectPath(state: unknown) {
	const from = (state as { from?: unknown } | null)?.from

	return typeof from === 'string' &&
		from.startsWith('/') &&
		!from.startsWith('//')
		? from
		: '/'
}
