import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Eye, Heart, ImagePlus, Pencil, Plus, Save, Share2, Trash2, X } from 'lucide-react'
import { AdminNav } from '../components/AdminNav'
import { Toast } from '../components/Toast'
import {
  deleteProject,
  getDashboardState,
  incrementProjectMetric,
  saveProject,
} from '../lib/content-store'
import { removeMediaFile, uploadMediaFile } from '../lib/media-storage'
import type { ProjectItem } from '../types/content'

type ProjectDraft = {
  id?: string
  title: string
  summary: string
  stack: string
  url: string
  imageUrl: string
  imageAlt: string
  likes: number
  views: number
  shares: number
  published: boolean
}

const emptyProjectDraft: ProjectDraft = {
  title: '',
  summary: '',
  stack: '',
  url: '',
  imageUrl: '',
  imageAlt: '',
  likes: 0,
  views: 0,
  shares: 0,
  published: true,
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      const dashboard = await getDashboardState()

      if (!active) {
        return
      }

      setProjects(dashboard.projects)
    }

    void loadProjects()

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
    setProjectDraft(emptyProjectDraft)
    setIsModalOpen(true)
  }

  function openEditModal(project: ProjectItem) {
    setProjectDraft({
      id: project.id,
      title: project.title,
      summary: project.summary,
      stack: project.stack,
      url: project.url,
      imageUrl: project.imageUrl,
      imageAlt: project.imageAlt,
      likes: project.likes,
      views: project.views,
      shares: project.shares,
      published: project.published,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setProjectDraft(emptyProjectDraft)
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const now = new Date().toISOString()
    const nextProject: ProjectItem = {
      id: projectDraft.id ?? crypto.randomUUID(),
      title: projectDraft.title.trim(),
      summary: projectDraft.summary.trim(),
      stack: projectDraft.stack.trim(),
      url: projectDraft.url.trim(),
      imageUrl: projectDraft.imageUrl,
      imageAlt: projectDraft.imageAlt.trim(),
      likes: projectDraft.likes,
      views: projectDraft.views,
      shares: projectDraft.shares,
      published: projectDraft.published,
      updatedAt: now,
    }

    const dashboard = await saveProject(nextProject)
    setProjects(dashboard.projects)
    setMessage(projectDraft.id ? 'Projeto atualizado.' : 'Projeto criado.')
    closeModal()
  }

  async function handleProjectImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploadingImage(true)

    try {
      const previousImageUrl = projectDraft.imageUrl
      const imageUrl = await uploadMediaFile(file, 'projects')

      if (previousImageUrl) {
        await removeMediaFile(previousImageUrl)
      }

      setProjectDraft((current) => ({
        ...current,
        imageUrl,
      }))
      setMessage('Imagem enviada para o Supabase.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.')
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  async function handleDeleteProject(projectId: string) {
    const project = projects.find((item) => item.id === projectId)
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir o projeto "${project?.title ?? 'sem título'}"?`,
    )

    if (!shouldDelete) {
      return
    }

    if (project?.imageUrl) {
      try {
        await removeMediaFile(project.imageUrl)
      } catch {
        setMessage('Projeto removido, mas a imagem antiga não pôde ser excluída.')
      }
    }

    const dashboard = await deleteProject(projectId)
    setProjects(dashboard.projects)
    setMessage('Projeto removido.')

    if (projectDraft.id === projectId) {
      closeModal()
    }
  }

  async function handleProjectMetric(projectId: string, metric: 'likes' | 'views' | 'shares') {
    const dashboard = await incrementProjectMetric(projectId, metric)
    setProjects(dashboard.projects)
    setMessage('Métricas atualizadas.')
  }

  async function handleRemoveDraftImage() {
    if (!projectDraft.imageUrl) {
      return
    }

    try {
      await removeMediaFile(projectDraft.imageUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível remover a imagem.')
      return
    }

    setProjectDraft((current) => ({
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
            <h2>Projetos</h2>
            <p>Gerencie seus projetos em cards e abra o formulário só quando precisar editar.</p>
          </div>

          <button className="button-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} />
            Cadastrar novo
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum projeto cadastrado.</strong>
            <p>Quando você adicionar o primeiro projeto, ele vai aparecer aqui em formato de card.</p>
          </div>
        ) : (
          <div className="admin-content-grid admin-content-grid-projects">
            {projects.map((project) => (
              <article key={project.id} className="admin-content-card">
                <div className="admin-content-media">
                  {project.imageUrl ? (
                    <img className="admin-content-image" src={project.imageUrl} alt={project.imageAlt || project.title} />
                  ) : null}

                  <div className="admin-content-badges">
                    <span className="carousel-overlay-badge">
                      {project.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>

                  <div className="admin-content-actions admin-content-actions-overlay">
                    <button className="button-secondary" type="button" onClick={() => openEditModal(project)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="button-danger" type="button" onClick={() => void handleDeleteProject(project.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="admin-content-body">
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>

                <footer className="admin-content-footer">
                  <div className="admin-content-metrics">
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleProjectMetric(project.id, 'likes')}
                    >
                      <Heart size={14} />
                      {project.likes}
                    </button>
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleProjectMetric(project.id, 'views')}
                    >
                      <Eye size={14} />
                      {project.views}
                    </button>
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleProjectMetric(project.id, 'shares')}
                    >
                      <Share2 size={14} />
                      {project.shares}
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
            aria-label={projectDraft.id ? 'Editar projeto' : 'Cadastrar projeto'}
          >
            <div className="admin-modal-header">
              <div>
                <h2>{projectDraft.id ? 'Editar projeto' : 'Cadastrar projeto'}</h2>
                <p>Preencha os campos e salve quando o card estiver pronto.</p>
              </div>

              <button className="button-secondary" type="button" onClick={closeModal}>
                <X size={16} />
                Fechar
              </button>
            </div>

            <form className="manager-form" onSubmit={(event) => void handleSaveProject(event)}>
              <label className="field">
                <span>Título</span>
                <input
                  value={projectDraft.title}
                  onChange={(event) =>
                    setProjectDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="field">
                <span>Resumo</span>
                <textarea
                  rows={4}
                  value={projectDraft.summary}
                  onChange={(event) =>
                    setProjectDraft((current) => ({ ...current, summary: event.target.value }))
                  }
                  required
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Stack</span>
                  <input
                    value={projectDraft.stack}
                    onChange={(event) =>
                      setProjectDraft((current) => ({ ...current, stack: event.target.value }))
                    }
                    placeholder="React, Vite, TypeScript"
                  />
                </label>

                <label className="field">
                  <span>URL</span>
                  <input
                    value={projectDraft.url}
                    onChange={(event) =>
                      setProjectDraft((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder="https://"
                  />
                </label>
              </div>

              <div className="upload-field">
                <span>Capa do projeto</span>
                <label className="upload-button" htmlFor="project-image-upload">
                  <ImagePlus size={18} />
                  {isUploadingImage ? 'Enviando...' : 'Fazer upload'}
                </label>
                <input
                  id="project-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleProjectImageUpload(event)}
                />

                {projectDraft.imageUrl ? (
                  <div className="upload-preview">
                    <img src={projectDraft.imageUrl} alt="Preview da capa do projeto" />
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
                  value={projectDraft.imageAlt}
                  onChange={(event) =>
                    setProjectDraft((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                  placeholder="Descreva a imagem do projeto"
                />
              </label>

              <div className="field-grid metrics-grid">
                <label className="field">
                  <span>Likes</span>
                  <input
                    type="number"
                    min="0"
                    value={projectDraft.likes}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,
                        likes: Number(event.target.value || '0'),
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>Visualizações</span>
                  <input
                    type="number"
                    min="0"
                    value={projectDraft.views}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,
                        views: Number(event.target.value || '0'),
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>Compartilhamentos</span>
                  <input
                    type="number"
                    min="0"
                    value={projectDraft.shares}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,
                        shares: Number(event.target.value || '0'),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={projectDraft.published}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      published: event.target.checked,
                    }))
                  }
                />
                <span>Publicado</span>
              </label>

              <div className="admin-modal-actions">
                <button className="button-secondary" type="button" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="button-primary" type="submit">
                  <Save size={18} />
                  {projectDraft.id ? 'Atualizar projeto' : 'Salvar projeto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  )
}
