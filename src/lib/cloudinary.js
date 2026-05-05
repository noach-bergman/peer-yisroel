const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024   // 50 MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024  // 100 MB

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]

export function isVideoFile(file) {
  return ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/')
}

export function validateMediaFile(file) {
  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_SIZE) return 'Video files must be under 100 MB.'
    return null
  }
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_SIZE) return 'Image files must be under 50 MB.'
    return null
  }
  return 'Please choose image or video files only.'
}

export async function uploadToCloudinary(file, folder = 'gallery') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env')
  }

  const resourceType = isVideoFile(file) ? 'video' : 'image'
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', folder)

  const res = await fetch(url, { method: 'POST', body })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Upload failed (${res.status})`)
  }

  const data = await res.json()
  return { secure_url: data.secure_url, public_id: data.public_id }
}
