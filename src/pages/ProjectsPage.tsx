import { ArrowUpRight, Eye, Heart, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectLinkDialog } from '../components/ProjectLinkDialog'
import {
  getDashboardInteractions,
  getDashboardState,
  getEmptyDashboardState,
  incrementProjectMetric,
  likeProjectOnce,
  viewProjectOnce,
} from '../lib/content-store'
import type { DashboardState, ProjectItem } from '../types/content'

export function ProjectsPage() {
  const [dashboard, setDashboard] = useState<DashboardState>(getEmptyDashboardState)
  const [interactions, setInteractions] = useState(() => getDashboardInteractions())

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      const nextDashboard = await getDashboardState()

      if (!active) {
        return
      }

      setDashboard(nextDashboard)
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="catalog-layout">
      <section className="catalog-hero panel">
        <span className="eyebrow">PROJETOS</span>
        <h1>Todos os projetos</h1>
        <p>
          Seleção completa dos projetos cadastrados no portfólio, reunindo interfaces, sistemas e
          soluções web desenvolvidas em diferentes contextos.
        </p>
      </section>

      <section className="catalog-grid">
        {dashboard.projects.map((project) => (
          <ProjectCatalogCard
            key={project.id}
            project={project}
            liked={interactions.projectLikes.includes(project.id)}
            viewed={interactions.projectViews.includes(project.id)}
            onLike={async () => {
              const result = await likeProjectOnce(project.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
            onShare={() => void handleShareProject(project, setDashboard)}
            onView={async () => {
              const result = await viewProjectOnce(project.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
          />
        ))}
      </section>
    </section>
  )
}

function ProjectCatalogCard({
  project,
  liked,
  viewed,
  onLike,
  onShare,
  onView,
}: {
  project: ProjectItem
  liked: boolean
  viewed: boolean
  onLike: () => Promise<void>
  onShare: () => void
  onView: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  async function handleOpenProject() {
    await onView()
    navigate(`/projetos/${project.id}`)
  }

  function handleProjectLinkClick(event?: { stopPropagation?: () => void }) {
    event?.stopPropagation?.()

    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer')
      return
    }

    setIsLinkDialogOpen(true)
  }

  return (
    <>
      <article className="carousel-card catalog-card">
        <div
          className="carousel-card-link-area"
          role="button"
          tabIndex={0}
          onClick={() => void handleOpenProject()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              void handleOpenProject()
            }
          }}
        >
          <div className="carousel-media">
            {project.imageUrl ? <img className="carousel-image" src={project.imageUrl} alt={project.imageAlt || project.title} /> : null}
            <button
              className="button-secondary carousel-card-link carousel-card-link-mobile"
              type="button"
              onClick={(event) => handleProjectLinkClick(event)}
            >
              Ver projeto
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="carousel-card-body">
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
          </div>
        </div>

        <div className="carousel-card-footer">
          <div className="carousel-metrics">
            <button
              className={`carousel-metric-button${liked ? ' is-active tooltip-trigger' : ''}`}
              type="button"
              onClick={() => void onLike()}
              data-tooltip={liked ? 'Você já deu like' : undefined}
            >
              <Heart size={14} />
              {project.likes}
            </button>
            <button
              className={`carousel-metric-button${viewed ? ' is-active tooltip-trigger' : ''}`}
              type="button"
              onClick={() => void handleOpenProject()}
              data-tooltip={viewed ? 'Esse projeto já foi visualizado' : undefined}
            >
              <Eye size={14} />
              {project.views}
            </button>
            <button className="carousel-metric-button" type="button" onClick={onShare}>
              <Share2 size={14} />
              {project.shares}
            </button>
          </div>

          <button className="button-secondary carousel-card-link" type="button" onClick={() => handleProjectLinkClick()}>
            Ver projeto
            <ArrowUpRight size={16} />
          </button>
        </div>
      </article>

      <ProjectLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        projectTitle={project.title}
      />
    </>
  )
}

async function handleShareProject(
  project: ProjectItem,
  setDashboard: (state: DashboardState) => void,
) {
  const detailPath = `/projetos/${project.id}`
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath

  setDashboard(await incrementProjectMetric(project.id, 'shares'))

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: project.title,
        text: project.summary,
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
