import { supabase } from '@/lib/supabase'

const PHOTO_BUCKET = 'activity-photos'
const PHOTO_MAX_SIDE = 1600

export function getActivityPhotoUrl(path: string) {
	return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

async function resize(file: File) {
	const bitmap = await createImageBitmap(file, {
		imageOrientation: 'from-image',
	})
	const scale = Math.min(
		1,
		PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
	)
	const width = Math.round(bitmap.width * scale)
	const height = Math.round(bitmap.height * scale)

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height

	const context = canvas.getContext('2d')
	if (!context) throw new Error('Canvas indisponible')

	context.drawImage(bitmap, 0, 0, width, height)
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

export async function uploadActivityPhoto(userId: string, file: File) {
	const blob = await resize(file)

	const path = `${userId}/${Date.now()}.jpg`

	const { error } = await supabase.storage
		.from(PHOTO_BUCKET)
		.upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })

	if (error) throw error

	return path
}

export async function removeActivityPhoto(path: string) {
	await supabase.storage.from(PHOTO_BUCKET).remove([path])
}
