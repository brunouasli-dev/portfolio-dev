import { isSupabaseConfigured, supabase } from './client'

const STORAGE_BUCKET = 'assets'
const PUBLIC_SEGMENT = `/storage/v1/object/public/${STORAGE_BUCKET}/`

function isMissingBucketError(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('bucket not found')
}

async function ensureStorageBucket() {
  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
  })

  if (error && !isMissingBucketError(error.message) && !error.message.toLowerCase().includes('already exists')) {
    throw new Error(error.message)
  }
}

function getFileExtension(fileName: string) {
  const segments = fileName.split('.')
  const extension = segments.length > 1 ? segments.at(-1)?.toLowerCase() : 'bin'
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'bin'
}

function getStoragePathFromUrl(url: string) {
  const markerIndex = url.indexOf(PUBLIC_SEGMENT)

  if (markerIndex === -1) {
    return null
  }

  return url.slice(markerIndex + PUBLIC_SEGMENT.length)
}

export async function uploadMediaFile(file: File, folder: 'projects' | 'blog' | 'stacks') {
  if (!isSupabaseConfigured) {
    return await readFileAsDataUrl(file)
  }

  const extension = getFileExtension(file.name)
  const filePath = `${folder}/${crypto.randomUUID()}.${extension}`

  let { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError && isMissingBucketError(uploadError.message)) {
    await ensureStorageBucket()

    const retryResult = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    uploadError = retryResult.error
  }

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

  return data.publicUrl
}

export async function removeMediaFile(url: string) {
  if (!url || url.startsWith('data:')) {
    return
  }

  const storagePath = getStoragePathFromUrl(url)

  if (!storagePath) {
    return
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])

  if (error) {
    throw new Error(error.message)
  }
}

export function isSupabaseStorageUrl(url: string) {
  return url.includes(PUBLIC_SEGMENT)
}

export const portfolioMediaBucket = STORAGE_BUCKET

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Não foi possível ler o arquivo selecionado.'))
    }

    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'))
    reader.readAsDataURL(file)
  })
}
