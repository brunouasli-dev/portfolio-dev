import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Eye, Heart, ImagePlus, Pencil, Plus, Save, Share2, Trash2, X } from 'lucide-react'
import { AdminNav } from '../components/AdminNav'
import { Toast } from '../components/Toast'
import {
  deleteBlogPost,
  getDashboardState,
  incrementBlogPostMetric,
  saveBlogPost,
} from '../lib/content-store'
import { removeMediaFile, uploadMediaFile } from '../lib/media-storage'
import type { BlogPostItem } from '../types/content'

type BlogDraft = {
  id?: string
  title: string
  excerpt: string
  content: string
  category: string
  imageUrl: string
  imageAlt: string
  likes: number
  views: number
  shares: number
  published: boolean
}

const emptyBlogDraft: BlogDraft = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  imageUrl: '',
  imageAlt: '',
  likes: 0,
  views: 0,
  shares: 0,
  published: false,
}

export function AdminBlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([])
  const [blogDraft, setBlogDraft] = useState<BlogDraft>(emptyBlogDraft)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    let active = true

    async function loadBlogPosts() {
      const dashboard = await getDashboardState()

      if (!active) {
        return
      }

      setBlogPosts(dashboard.blogPosts)
    }

    void loadBlogPosts()

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
    setBlogDraft(emptyBlogDraft)
    setIsModalOpen(true)
  }

  function openEditModal(post: BlogPostItem) {
    setBlogDraft({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl,
      imageAlt: post.imageAlt,
      likes: post.likes,
      views: post.views,
      shares: post.shares,
      published: post.published,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setBlogDraft(emptyBlogDraft)
  }

  async function handleSavePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const now = new Date().toISOString()
    const nextPost: BlogPostItem = {
      id: blogDraft.id ?? crypto.randomUUID(),
      title: blogDraft.title.trim(),
      excerpt: blogDraft.excerpt.trim(),
      content: blogDraft.content.trim(),
      category: blogDraft.category.trim(),
      imageUrl: blogDraft.imageUrl,
      imageAlt: blogDraft.imageAlt.trim(),
      likes: blogDraft.likes,
      views: blogDraft.views,
      shares: blogDraft.shares,
      published: blogDraft.published,
      updatedAt: now,
    }

    const dashboard = await saveBlogPost(nextPost)
    setBlogPosts(dashboard.blogPosts)
    setMessage(blogDraft.id ? 'Post atualizado.' : 'Post criado.')
    closeModal()
  }

  async function handleBlogImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploadingImage(true)

    try {
      const previousImageUrl = blogDraft.imageUrl
      const imageUrl = await uploadMediaFile(file, 'blog')

      if (previousImageUrl) {
        await removeMediaFile(previousImageUrl)
      }

      setBlogDraft((current) => ({
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

  async function handleDeletePost(postId: string) {
    const post = blogPosts.find((item) => item.id === postId)
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir o post "${post?.title ?? 'sem título'}"?`,
    )

    if (!shouldDelete) {
      return
    }

    if (post?.imageUrl) {
      try {
        await removeMediaFile(post.imageUrl)
      } catch {
        setMessage('Post removido, mas a imagem antiga não pôde ser excluída.')
      }
    }

    const dashboard = await deleteBlogPost(postId)
    setBlogPosts(dashboard.blogPosts)
    setMessage('Post removido.')

    if (blogDraft.id === postId) {
      closeModal()
    }
  }

  async function handleBlogMetric(postId: string, metric: 'likes' | 'views' | 'shares') {
    const dashboard = await incrementBlogPostMetric(postId, metric)
    setBlogPosts(dashboard.blogPosts)
    setMessage('Métricas atualizadas.')
  }

  async function handleRemoveDraftImage() {
    if (!blogDraft.imageUrl) {
      return
    }

    try {
      await removeMediaFile(blogDraft.imageUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível remover a imagem.')
      return
    }

    setBlogDraft((current) => ({
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
            <h2>Blog</h2>
            <p>Visualize os posts em cards e abra o formulário apenas quando for criar ou editar.</p>
          </div>

          <button className="button-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} />
            Cadastrar novo
          </button>
        </div>

        {blogPosts.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum post cadastrado.</strong>
            <p>Os posts criados vão aparecer aqui em cards para editar ou excluir.</p>
          </div>
        ) : (
          <div className="admin-content-grid admin-content-grid-blog">
            {blogPosts.map((post) => (
              <article key={post.id} className="admin-content-card">
                <div className="admin-content-media">
                  {post.imageUrl ? (
                    <img className="admin-content-image" src={post.imageUrl} alt={post.imageAlt || post.title} />
                  ) : null}

                  <div className="admin-content-badges">
                    <span className="carousel-overlay-badge">{post.category || 'Categoria'}</span>
                    <span className="carousel-overlay-badge">
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>

                  <div className="admin-content-actions admin-content-actions-overlay">
                    <button className="button-secondary" type="button" onClick={() => openEditModal(post)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="button-danger" type="button" onClick={() => void handleDeletePost(post.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="admin-content-body">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>

                <footer className="admin-content-footer">
                  <div className="admin-content-metrics">
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleBlogMetric(post.id, 'likes')}
                    >
                      <Heart size={14} />
                      {post.likes}
                    </button>
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleBlogMetric(post.id, 'views')}
                    >
                      <Eye size={14} />
                      {post.views}
                    </button>
                    <button
                      className="admin-content-metric"
                      type="button"
                      onClick={() => void handleBlogMetric(post.id, 'shares')}
                    >
                      <Share2 size={14} />
                      {post.shares}
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
            aria-label={blogDraft.id ? 'Editar post' : 'Cadastrar post'}
          >
            <div className="admin-modal-header">
              <div>
                <h2>{blogDraft.id ? 'Editar post' : 'Cadastrar post'}</h2>
                <p>Preencha os dados do card e do conteúdo antes de salvar.</p>
              </div>

              <button className="button-secondary" type="button" onClick={closeModal}>
                <X size={16} />
                Fechar
              </button>
            </div>

            <form className="manager-form" onSubmit={(event) => void handleSavePost(event)}>
              <label className="field">
                <span>Título</span>
                <input
                  value={blogDraft.title}
                  onChange={(event) =>
                    setBlogDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Categoria</span>
                  <input
                    value={blogDraft.category}
                    onChange={(event) =>
                      setBlogDraft((current) => ({ ...current, category: event.target.value }))
                    }
                    placeholder="React, Backend, Carreira"
                  />
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={blogDraft.published}
                    onChange={(event) =>
                      setBlogDraft((current) => ({
                        ...current,
                        published: event.target.checked,
                      }))
                    }
                  />
                  <span>Publicado</span>
                </label>
              </div>

              <label className="field">
                <span>Resumo curto</span>
                <textarea
                  rows={4}
                  value={blogDraft.excerpt}
                  onChange={(event) =>
                    setBlogDraft((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="field">
                <span>Conteúdo</span>
                <textarea
                  rows={8}
                  value={blogDraft.content}
                  onChange={(event) =>
                    setBlogDraft((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder="Escreva o conteúdo do post aqui..."
                />
              </label>

              <div className="upload-field">
                <span>Capa do post</span>
                <label className="upload-button" htmlFor="blog-image-upload">
                  <ImagePlus size={18} />
                  {isUploadingImage ? 'Enviando...' : 'Fazer upload'}
                </label>
                <input
                  id="blog-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleBlogImageUpload(event)}
                />

                {blogDraft.imageUrl ? (
                  <div className="upload-preview">
                    <img src={blogDraft.imageUrl} alt="Preview da capa do post" />
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
                  value={blogDraft.imageAlt}
                  onChange={(event) =>
                    setBlogDraft((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                  placeholder="Descreva a imagem do post"
                />
              </label>

              <div className="field-grid metrics-grid">
                <label className="field">
                  <span>Likes</span>
                  <input
                    type="number"
                    min="0"
                    value={blogDraft.likes}
                    onChange={(event) =>
                      setBlogDraft((current) => ({
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
                    value={blogDraft.views}
                    onChange={(event) =>
                      setBlogDraft((current) => ({
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
                    value={blogDraft.shares}
                    onChange={(event) =>
                      setBlogDraft((current) => ({
                        ...current,
                        shares: Number(event.target.value || '0'),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button className="button-secondary" type="button" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="button-primary" type="submit">
                  <Save size={18} />
                  {blogDraft.id ? 'Atualizar post' : 'Salvar post'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  )
}
