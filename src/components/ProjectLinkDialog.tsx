type ProjectLinkDialogProps = {
  isOpen: boolean
  onClose: () => void
  projectTitle: string
  message?: string
}

const DEFAULT_MESSAGE =
  'Pinguim Elétrico foi tão desastrado que esqueceu de colocar o link deste projeto. Pinguim Trovoada ficou sabendo do erro e apareceu segurando este diálogo antes que a vergonha virasse deploy.'

export function ProjectLinkDialog({
  isOpen,
  onClose,
  projectTitle,
  message = DEFAULT_MESSAGE,
}: ProjectLinkDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal panel project-link-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-link-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h2 id="project-link-dialog-title">Link indisponivel</h2>
            <p>{projectTitle}</p>
          </div>
          <button className="button-secondary" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="project-link-dialog-body">
          <img
            className="project-link-dialog-image"
            src="/pinguin-em-fuga-no-escritorio.png"
            alt="Ilustração do Pinguim Elétrico correndo de medo do Pinguim Trovoada"
          />
          <p>{message}</p>
        </div>
      </div>
    </div>
  )
}
