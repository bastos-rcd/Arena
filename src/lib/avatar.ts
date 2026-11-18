import { supabase } from '@/lib/supabase'

const AVATAR_BUCKET = 'avatars'
const AVATAR_SIZE = 512

export function getAvatarUrl(path: string) {
	return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl
}

async function resizeToSquare(file: File) {
	const bitmap = await createImageBitmap(file, {
		imageOrientation: 'from-image',
	})
	const side = Math.min(bitmap.width, bitmap.height)
	const size = Math.min(AVATAR_SIZE, side)

	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size

	const context = canvas.getContext('2d')
	if (!context) throw new Error('Canvas indisponible')

	context.fillStyle = '#252C37'
	context.fillRect(0, 0, size, size)
	context.drawImage(
		bitmap,
		(bitmap.width - side) / 2,
		(bitmap.height - side) / 2,
		side,
		side,
		0,
		0,
		size,
		size,
	)
	bitmap.close()

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error('Conversion impossible')),
			'image/jpeg',
			0.85,
		)
	})
}

export async function uploadAvatar(userId: string, file: File) {
	const blob = await resizeToSquare(file)

	const path = `${userId}/${Date.now()}.jpg`

	const { error } = await supabase.storage
		.from(AVATAR_BUCKET)
		.upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })

	if (error) throw error

	return path
}

export async function removeAvatars(userId: string, keepPath?: string) {
	const { data } = await supabase.storage.from(AVATAR_BUCKET).list(userId)

	const paths = (data ?? [])
		.map((file) => `${userId}/${file.name}`)
		.filter((path) => path !== keepPath)

	if (paths.length > 0) {
		await supabase.storage.from(AVATAR_BUCKET).remove(paths)
	}
}
