import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { AdminNav } from '../components/AdminNav'
import { StackLogo } from '../components/StackLogo'
import { Toast } from '../components/Toast'
import { deleteStack, getDashboardState, saveStack } from '../lib/content-store'
import { removeMediaFile, uploadMediaFile } from '../lib/media-storage'
import type { StackItem } from '../types/content'

type StackDraft = {
  id?: string
  name: string
  link: string
  imageUrl: string
  imageAlt: string
}

const emptyStackDraft: StackDraft = {
  name: '',
  link: '',
  imageUrl: '',
  imageAlt: '',
}

export function AdminStacksPage() {
  const [stacks, setStacks] = useState<StackItem[]>([])
  const [stackDraft, setStackDraft] = useState<StackDraft>(emptyStackDraft)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    let active = true

    async function loadStacks() {
      const dashboard = await getDashboardState()

      if (!active) {
        return
      }

      setStacks(dashboard.stacks)
    }

    void loadStacks()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setMessage('')
    }, 3200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [message])

  function openCreateModal() {
    setStackDraft(emptyStackDraft)
    setIsModalOpen(true)
  }

  function openEditModal(stack: StackItem) {
    setStackDraft({
      id: stack.id,
      name: stack.name,
      link: stack.link,
      imageUrl: stack.imageUrl,
      imageAlt: stack.imageAlt,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setStackDraft(emptyStackDraft)
  }

  async function handleSaveStack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const now = new Date().toISOString()
    const nextStack: StackItem = {
      id: stackDraft.id ?? crypto.randomUUID(),
      name: stackDraft.name.trim(),
      link: stackDraft.link.trim(),
      imageUrl: stackDraft.imageUrl,
      imageAlt: stackDraft.imageAlt.trim(),
      updatedAt: now,
    }

    const dashboard = await saveStack(nextStack)
    setStacks(dashboard.stacks)
    setMessage(stackDraft.id ? 'Habilidade atualizada.' : 'Habilidade criada.')
    closeModal()
  }

  async function handleStackImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploadingImage(true)

    try {
      const previousImageUrl = stackDraft.imageUrl
      const imageUrl = await uploadMediaFile(file, 'stacks')

      if (previousImageUrl) {
        await removeMediaFile(previousImageUrl)
      }

      setStackDraft((current) => ({
        ...current,
        imageUrl,
      }))
      setMessage('Imagem enviada.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.')
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  async function handleDeleteStack(stackId: string) {
    const stack = stacks.find((item) => item.id === stackId)
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir a habilidade "${stack?.name ?? 'sem nome'}"?`,
    )

    if (!shouldDelete) {
      return
    }

    if (stack?.imageUrl) {
      try {
        await removeMediaFile(stack.imageUrl)
      } catch {
        setMessage('Habilidade removida, mas a imagem antiga não pôde ser excluída.')
      }
    }

    const dashboard = await deleteStack(stackId)
    setStacks(dashboard.stacks)
    setMessage('Habilidade removida.')

    if (stackDraft.id === stackId) {
      closeModal()
    }
  }

  async function handleRemoveDraftImage() {
    if (!stackDraft.imageUrl) {
      return
    }

    try {
      await removeMediaFile(stackDraft.imageUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível remover a imagem.')
      return
    }

    setStackDraft((current) => ({
      ...current,
      imageUrl: '',
    }))
    setMessage('Imagem removida.')
  }

  return (
    <section className="dashboard-shell">
      <AdminNav />

      {message ? <Toast message={message} onClose={() => setMessage('')} /> : null}

      <section className="manager-panel panel admin-collection-panel">
        <div className="manager-header admin-collection-header">
          <div className="manager-heading admin-collection-copy">
            <h2>Habilidades</h2>
            <p>Cadastre as tecnologias com nome, link e imagem para usar no portfólio.</p>
          </div>

          <button className="button-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} />
            Cadastrar nova
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma habilidade cadastrada.</strong>
            <p>As habilidades adicionadas aqui vão alimentar a área pública do site.</p>
          </div>
        ) : (
          <div className="admin-content-grid admin-content-grid-stacks">
            {stacks.map((stack) => (
              <article key={stack.id} className="admin-content-card">
                <div className="admin-content-media">
                  <StackLogo name={stack.name} imageUrl={stack.imageUrl} imageAlt={stack.imageAlt} variant="admin" />
                </div>

                <div className="admin-content-body">
                  <h3>{stack.name}</h3>
                  <p>{stack.link || 'Sem link configurado.'}</p>
                </div>

                <footer className="admin-content-footer">
                  <div className="admin-content-actions admin-content-actions-icons">
                    <button className="button-secondary" type="button" onClick={() => openEditModal(stack)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="button-danger" type="button" onClick={() => void handleDeleteStack(stack.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div className="admin-modal-backdrop">
          <section
            className="admin-modal panel"
            role="dialog"
            aria-modal="true"
            aria-label={stackDraft.id ? 'Editar habilidade' : 'Cadastrar habilidade'}
          >
            <div className="admin-modal-header">
              <div>
                <h2>{stackDraft.id ? 'Editar habilidade' : 'Cadastrar habilidade'}</h2>
                <p>Preencha os dados e salve quando a habilidade estiver pronta.</p>
              </div>

              <button className="button-secondary" type="button" onClick={closeModal}>
                <X size={16} />
                Fechar
              </button>
            </div>

            <form className="manager-form" onSubmit={(event) => void handleSaveStack(event)}>
              <label className="field">
                <span>Nome</span>
                <input
                  value={stackDraft.name}
                  onChange={(event) =>
                    setStackDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="field">
                <span>Link</span>
                <input
                  type="url"
                  value={stackDraft.link}
                  onChange={(event) =>
                    setStackDraft((current) => ({ ...current, link: event.target.value }))
                  }
                  placeholder="https://"
                />
              </label>

              <div className="upload-field">
                <span>Imagem da habilidade</span>
                <label className="upload-button" htmlFor="stack-image-upload">
                  <ImagePlus size={18} />
                  {isUploadingImage ? 'Enviando...' : 'Fazer upload'}
                </label>
                <input
                  id="stack-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleStackImageUpload(event)}
                />

                {stackDraft.imageUrl ? (
                  <div className="upload-preview">
                    <img src={stackDraft.imageUrl} alt="Preview da imagem da habilidade" />
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => void handleRemoveDraftImage()}
                    >
                      <X size={16} />
                      Remover imagem
                    </button>
                  </div>
                ) : null}
              </div>

              <label className="field">
                <span>Texto alternativo da imagem</span>
                <input
                  value={stackDraft.imageAlt}
                  onChange={(event) =>
                    setStackDraft((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                  placeholder="Descreva a imagem da habilidade"
                />
              </label>

              <div className="admin-modal-actions">
                <button className="button-secondary" type="button" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="button-primary" type="submit" disabled={isUploadingImage}>
                  <Save size={18} />
                  {stackDraft.id ? 'Atualizar habilidade' : 'Salvar habilidade'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  )
}
