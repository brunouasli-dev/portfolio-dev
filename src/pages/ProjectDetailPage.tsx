import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Eye, Heart, Share2 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ProjectLinkDialog } from '../components/ProjectLinkDialog'
import {
  getDashboardInteractions,
  getEmptyDashboardState,
  incrementProjectMetric,
  likeProjectOnce,
  viewProjectOnce,
} from '../lib/content-store'

export function ProjectDetailPage() {
  const { projectId } = useParams()

  if (!projectId) {
    return <Navigate to="/" replace />
  }

  return <ProjectDetailContent key={projectId} projectId={projectId} />
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(getEmptyDashboardState)
  const [interactions, setInteractions] = useState(() => getDashboardInteractions())
  const [ready, setReady] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProject() {
      const result = await viewProjectOnce(projectId)

      if (!active) {
        return
      }

      setDashboard(result.dashboard)
      setInteractions(result.interactions)
      setReady(true)
    }

    void loadProject()

    return () => {
      active = false
    }
  }, [projectId])

  if (!ready) {
    return <div className="panel loading-panel">Carregando projeto...</div>
  }

  const project = dashboard.projects.find((item) => item.id === projectId) ?? null
  const relatedProjects = dashboard.projects.filter((item) => item.id !== projectId).slice(0, 4)

  if (!project) {
    return <Navigate to="/" replace />
  }

  const currentProject = project

  const stackItems = currentProject.stack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const liked = interactions.projectLikes.includes(currentProject.id)
  const viewed = interactions.projectViews.includes(currentProject.id)

  async function handleShare() {
    const detailPath = `/projetos/${currentProject.id}`
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath
    const nextDashboard = await incrementProjectMetric(currentProject.id, 'shares')
    setDashboard(nextDashboard)

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: currentProject.title,
          text: currentProject.summary,
          url: shareUrl,
        })
        return
      } catch {
        return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  async function handleLike() {
    const result = await likeProjectOnce(currentProject.id)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
  }

  async function handleOpenRelatedProject(nextProjectId: string) {
    const result = await viewProjectOnce(nextProjectId)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
    navigate(`/projetos/${nextProjectId}`)
  }

  async function handleRelatedLike(nextProjectId: string) {
    const result = await likeProjectOnce(nextProjectId)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
  }

  async function handleRelatedShare(nextProjectId: string) {
    const relatedProject = dashboard.projects.find((item) => item.id === nextProjectId)

    if (!relatedProject) {
      return
    }

    const detailPath = `/projetos/${relatedProject.id}`
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath
    const nextDashboard = await incrementProjectMetric(relatedProject.id, 'shares')
    setDashboard(nextDashboard)

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: relatedProject.title,
          text: relatedProject.summary,
          url: shareUrl,
        })
        return
      } catch {
        return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  function handleProjectLinkClick() {
    if (currentProject.url) {
      window.open(currentProject.url, '_blank', 'noopener,noreferrer')
      return
    }

    setIsLinkDialogOpen(true)
  }

  return (
    <>
      <section className="detail-layout">
        <article className="detail-main panel">
        <div className="detail-media">
          {currentProject.imageUrl ? (
            <img className="detail-image" src={currentProject.imageUrl} alt={currentProject.imageAlt || currentProject.title} />
          ) : null}

          <div className="detail-media-overlay detail-media-overlay-desktop">
            <div className="detail-media-actions">
              <button
                className={`detail-media-pill detail-action-button${liked ? ' is-active' : ''}${liked ? ' tooltip-trigger' : ''}`}
                type="button"
                onClick={() => void handleLike()}
                data-tooltip={liked ? 'Você já deu like' : undefined}
              >
                <Heart size={15} />
                {currentProject.likes}
              </button>
              <button
                className={`detail-media-pill detail-action-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
                type="button"
                data-tooltip={viewed ? 'Esse projeto já foi visualizado' : undefined}
              >
                <Eye size={15} />
                {currentProject.views}
              </button>
              <button className="detail-media-pill detail-action-button" type="button" onClick={() => void handleShare()}>
                <Share2 size={15} />
                {currentProject.shares}
              </button>
            </div>

            <button className="detail-media-link" type="button" onClick={handleProjectLinkClick}>
                Ver projeto
                <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="detail-main-body">
          <div className="detail-topline">
            <Link className="detail-backlink" to="/">
              <ArrowLeft size={16} />
              Voltar
            </Link>
            <span className="eyebrow detail-topline-badge">PROJETO</span>
            <button className="detail-media-link detail-media-link-mobile" type="button" onClick={handleProjectLinkClick}>
                Ver projeto
                <ArrowUpRight size={18} />
            </button>
          </div>

          <header className="detail-header">
            <h1>{currentProject.title}</h1>
            <p className="detail-summary">{currentProject.summary}</p>
          </header>

          <div className="detail-article">
            <section className="detail-section">
              <h2>Stack</h2>
              <div className="detail-tags">
                {stackItems.map((item) => (
                  <span key={item} className="detail-tag">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <footer className="detail-footer">
            <div className="detail-media-actions">
              <button
                className={`detail-media-pill detail-action-button${liked ? ' is-active' : ''}${liked ? ' tooltip-trigger' : ''}`}
                type="button"
                onClick={() => void handleLike()}
                data-tooltip={liked ? 'Você já deu like' : undefined}
              >
                <Heart size={15} />
                {currentProject.likes}
              </button>
              <button
                className={`detail-media-pill detail-action-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
                type="button"
                data-tooltip={viewed ? 'Esse projeto já foi visualizado' : undefined}
              >
                <Eye size={15} />
                {currentProject.views}
              </button>
              <button className="detail-media-pill detail-action-button" type="button" onClick={() => void handleShare()}>
                <Share2 size={15} />
                {currentProject.shares}
              </button>
            </div>

            <button className="detail-media-link" type="button" onClick={handleProjectLinkClick}>
                Ver projeto
                <ArrowUpRight size={18} />
            </button>
          </footer>
        </div>
        </article>

        <aside className="detail-sidebar panel">
        <div className="detail-sidebar-header">
          <h2>
            Outros projetos <span className="detail-accent">relacionados</span>
          </h2>
        </div>

        <div className="detail-sidebar-list">
          {relatedProjects.map((item) => (
            <article key={item.id} className="detail-related-card">
              <button
                className="detail-related-link"
                type="button"
                onClick={() => void handleOpenRelatedProject(item.id)}
              >
                {item.imageUrl ? (
                  <img className="detail-related-image" src={item.imageUrl} alt={item.imageAlt || item.title} />
                ) : null}
                <div className="detail-related-body">
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
              </button>

              <footer className="detail-related-footer">
                <div className="detail-related-metrics">
                  <button
                    className={`detail-related-action-button${interactions.projectLikes.includes(item.id) ? ' is-active tooltip-trigger' : ''}`}
                    type="button"
                    onClick={() => void handleRelatedLike(item.id)}
                    data-tooltip={interactions.projectLikes.includes(item.id) ? 'Você já deu like' : undefined}
                  >
                    <Heart size={13} />
                    {item.likes}
                  </button>
                  <button
                    className={`detail-related-action-button${interactions.projectViews.includes(item.id) ? ' is-active tooltip-trigger' : ''}`}
                    type="button"
                    onClick={() => void handleOpenRelatedProject(item.id)}
                    data-tooltip={
                      interactions.projectViews.includes(item.id)
                        ? 'Esse projeto já foi visualizado'
                        : undefined
                    }
                  >
                    <Eye size={13} />
                    {item.views}
                  </button>
                  <button
                    className="detail-related-action-button"
                    type="button"
                    onClick={() => void handleRelatedShare(item.id)}
                  >
                    <Share2 size={13} />
                    {item.shares}
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
        </aside>
      </section>

      <ProjectLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        projectTitle={currentProject.title}
      />
    </>
  )
}
