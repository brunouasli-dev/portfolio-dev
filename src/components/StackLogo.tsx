import { ImageOff } from 'lucide-react'

export function StackLogo({
  name,
  imageUrl,
  variant = 'carousel',
}: {
  name: string
  imageUrl?: string
  variant?: 'carousel' | 'admin'
}) {
  const resolvedImageUrl = imageUrl?.trim() ?? ''
  const mediaClassName = variant === 'admin' ? 'admin-content-image' : 'carousel-image'

  if (resolvedImageUrl) {
    return (
      <div className={mediaClassName}>
        <img className="stack-logo-local-image" src={resolvedImageUrl} alt={name} />
      </div>
    )
  }

  return (
    <div className={`${mediaClassName} stack-logo-surface`} aria-label={name} role="img">
      <div className="stack-logo-placeholder">
        <ImageOff size={28} />
        <span>Sem imagem</span>
      </div>
    </div>
  )
}
