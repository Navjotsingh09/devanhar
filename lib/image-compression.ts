// Client-side downscale/re-encode before upload, mirrors the pattern used for
// camp ID documents in components/camp-application-form.tsx.
const MAX_DIMENSION = 800

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')) }
    img.src = url
  })
}

export async function preparePhotoForUpload(file: File): Promise<File> {
  try {
    const img = await loadImageElement(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
    )
    if (!blob) return file
    return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}
