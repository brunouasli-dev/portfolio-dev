import { X } from 'lucide-react'

type ToastProps = {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <p>{message}</p>
      <button className="toast-close" type="button" onClick={onClose} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  )
}
