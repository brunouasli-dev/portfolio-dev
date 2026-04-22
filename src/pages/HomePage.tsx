import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Eye,
  Heart,
  Mail,
  Share2,
} from 'lucide-react'
import { FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6'
import { Link, useNavigate } from 'react-router-dom'
import { StackLogo } from '../components/StackLogo'
import {
  getDashboardInteractions,
  getDashboardState,
  getEmptyDashboardState,
  incrementBlogPostMetric,
  incrementProjectMetric,
  likeBlogPostOnce,
  likeProjectOnce,
  viewBlogPostOnce,
  viewProjectOnce,
} from '../lib/content-store'
import { siteProfile } from '../lib/site-profile'
import type { BlogPostItem, DashboardState, ProjectItem, StackItem } from '../types/content'

export function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardState>(getEmptyDashboardState)
  const [interactions, setInteractions] = useState(() => getDashboardInteractions())
  const heroPrefix = `Olá, sou ${siteProfile.fullName}, `
  const heroAccent = siteProfile.role
  const heroSuffix = '.'
  const heroText = `${heroPrefix}${heroAccent}${heroSuffix}`
  const [typedCount, setTypedCount] = useState(0)

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

  useEffect(() => {
    if (typedCount >= heroText.length) {
      return
    }

    const timer = window.setTimeout(() => {
      setTypedCount((current) => Math.min(current + 1, heroText.length))
    }, 28)

    return () => window.clearTimeout(timer)
  }, [typedCount, heroText.length])

  const visiblePrefix = heroPrefix.slice(0, Math.min(typedCount, heroPrefix.length))
  const accentStart = heroPrefix.length
  const visibleAccent = heroAccent.slice(
    0,
    Math.max(0, Math.min(typedCount - accentStart, heroAccent.length)),
  )
  const suffixStart = heroPrefix.length + heroAccent.length
  const visibleSuffix = heroSuffix.slice(0, Math.max(0, typedCount - suffixStart))

  return (
    <>
      <section className="hero-panel panel">
        <div className="hero-copy-block">
          <h1
            className="hero-code-title"
            aria-label={`Olá, sou ${siteProfile.fullName}, ${siteProfile.role}.`}
          >
            <span className="hero-code-line">
              {visiblePrefix}
              <span className="hero-code-accent">{visibleAccent}</span>
              {visibleSuffix}
              <span className="hero-code-cursor" aria-hidden="true" />
            </span>
          </h1>
          <p className="hero-text">{siteProfile.heroDescription}</p>

          <div className="hero-actions">
            <a className="button-primary" href={siteProfile.resumePath} download>
              Baixar CV
              <Download size={18} />
            </a>
            <a className="button-secondary" href="#contato">
              Entrar em contato
            </a>
          </div>
        </div>

        <div className="hero-image-card">
          <div className="hero-image-frame">
            <img src={siteProfile.profileImagePath} alt={`Retrato ilustrado de ${siteProfile.fullName}`} />
          </div>
        </div>
      </section>

      <section id="sobre" className="about-section panel">
        <div className="about-layout">
          <div className="about-image-card">
            <div className="about-image-frame">
              <img
                src={siteProfile.showcaseImagePath}
                alt={`Imagem conceitual de projetos de ${siteProfile.fullName}`}
              />
            </div>
          </div>

          <div className="about-copy">
            <span className="eyebrow">SOBRE</span>
            <h2>{siteProfile.aboutTitle}</h2>
            {siteProfile.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="atuacao" className="capabilities-section panel">
        <div className="capabilities-header">
          <span className="eyebrow">ATUAÇÃO</span>
          <h2>O que eu construo na prática</h2>
          <p>{siteProfile.capabilityIntro}</p>
        </div>

        <div className="capabilities-grid">
          {siteProfile.capabilities.map((capability) => (
            <article key={capability.title} className="capability-card">
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <ContentCarousel
        eyebrow="PROJETOS"
        title="Projetos em destaque"
        description="Experimentos, sistemas e invenções digitais que parecem ter saído de uma madrugada produtiva demais e deram surpreendentemente certo."
        items={dashboard.projects}
        viewAllPath="/projetos"
        renderItem={(project) => (
          <ProjectCard
            project={project}
            liked={interactions.projectLikes.includes(project.id)}
            viewed={interactions.projectViews.includes(project.id)}
            onLike={async () => {
              const result = await likeProjectOnce(project.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
            onShare={() => void handleShare('project', project, setDashboard)}
            onView={async () => {
              const result = await viewProjectOnce(project.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
          />
        )}
      />

      <ContentCarousel
        eyebrow="HABILIDADES"
        title="Habilidades e ferramentas"
        description="As ferramentas que ajudam o Pinguim Elétrico a montar interface, sobreviver a bug inesperado e evitar mais um cascudo do Trovoada."
        items={dashboard.stacks}
        viewAllPath="/habilidades"
        sectionClassName="stacks-carousel-section"
        trackClassName="stacks-carousel-track"
        cardClassName="stacks-carousel-card"
        renderItem={(stack) => <StackCard stack={stack} />}
      />

      <ContentCarousel
        eyebrow="BLOG"
        title="Conteúdos publicados"
        description="Anotações de campo sobre código, interface, gambiarra evitada por pouco e pequenas lições aprendidas no gelo da vida real."
        items={dashboard.blogPosts}
        viewAllPath="/blog"
        renderItem={(post) => (
          <BlogCard
            post={post}
            liked={interactions.blogLikes.includes(post.id)}
            viewed={interactions.blogViews.includes(post.id)}
            onLike={async () => {
              const result = await likeBlogPostOnce(post.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
            onShare={() => void handleShare('blog', post, setDashboard)}
            onView={async () => {
              const result = await viewBlogPostOnce(post.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
          />
        )}
      />

      <section id="contato" className="contact-cta panel">
        <div className="contact-cta-copy">
          <span className="eyebrow">CONTATO</span>
          <h2>Entre em contato</h2>
          <p>{siteProfile.contactCta}</p>
        </div>

        <div className="contact-cta-grid">
          <a
            className="contact-cta-card contact-cta-link"
            href={`mailto:${siteProfile.email}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-cta-icon">
              <Mail size={18} />
            </div>
            <p>E-mail</p>
          </a>

          <a
            className="contact-cta-card contact-cta-link"
            href={siteProfile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-cta-icon">
              <FaLinkedinIn size={18} />
            </div>
            <p>LinkedIn</p>
          </a>

          <a
            className="contact-cta-card contact-cta-link"
            href={siteProfile.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-cta-icon">
              <FaWhatsapp size={18} />
            </div>
            <p>WhatsApp</p>
          </a>
        </div>
      </section>
    </>
  )
}

function ContentCarousel<T extends { id: string }>({
  eyebrow,
  title,
  description,
  items,
  renderItem,
  viewAllPath,
  viewAllLabel = 'Ver todos',
  sectionClassName,
  cardClassName,
  trackClassName,
  emptyMessage = 'Nenhum item foi encontrado nesta seção ainda.',
}: {
  eyebrow: string
  title: string
  description: string
  items: T[]
  renderItem: (item: T) => ReactNode
  viewAllPath?: string
  viewAllLabel?: string
  sectionClassName?: string
  cardClassName?: string
  trackClassName?: string
  emptyMessage?: string
}) {
  const viewportRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    const viewport = viewportRef.current

    if (!viewport) {
      return
    }

    const amount = Math.max(320, Math.floor(viewport.clientWidth * 0.82))

    viewport.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className={`carousel-section panel${sectionClassName ? ` ${sectionClassName}` : ''}`}>
      <div className="carousel-header">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="carousel-header-actions">
          {viewAllPath ? (
            <Link className="button-secondary carousel-view-all" to={viewAllPath}>
              {viewAllLabel}
              <ArrowUpRight size={16} />
            </Link>
          ) : null}

          <div className="carousel-controls">
            <button className="carousel-button" type="button" onClick={() => scroll('left')}>
              <ArrowLeft size={18} />
            </button>
            <button className="carousel-button" type="button" onClick={() => scroll('right')}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <strong>Nada por aqui ainda.</strong>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div
          ref={viewportRef}
          className={`carousel-track${trackClassName ? ` ${trackClassName}` : ''}`}
          aria-label={title}
        >
          {items.map((item) => (
            <article key={item.id} className={`carousel-card${cardClassName ? ` ${cardClassName}` : ''}`}>
              {renderItem(item)}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ProjectCard({
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

  async function handleOpenProject() {
    await onView()
    navigate(`/projetos/${project.id}`)
  }

  return (
    <>
      <button className="carousel-card-link-area" type="button" onClick={() => void handleOpenProject()}>
        <div className="carousel-media">
          {project.imageUrl ? <img className="carousel-image" src={project.imageUrl} alt={project.imageAlt || project.title} /> : null}
        </div>

        <div className="carousel-card-body">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
        </div>
      </button>

      <div className="carousel-card-footer">
        <div className="carousel-metrics">
          <button
            className={`carousel-metric-button${liked ? ' is-active' : ''}${liked ? ' tooltip-trigger' : ''}`}
            type="button"
            onClick={() => void onLike()}
            data-tooltip={liked ? 'Você já deu like' : undefined}
          >
            <Heart size={14} />
            {project.likes}
          </button>
          <button
            className={`carousel-metric-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
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
      </div>
    </>
  )
}

function BlogCard({
  post,
  liked,
  viewed,
  onLike,
  onShare,
  onView,
}: {
  post: BlogPostItem
  liked: boolean
  viewed: boolean
  onLike: () => Promise<void>
  onShare: () => void
  onView: () => Promise<void>
}) {
  const navigate = useNavigate()

  async function handleOpenPost() {
    await onView()
    navigate(`/blog/${post.id}`)
  }

  return (
    <>
      <button className="carousel-card-link-area" type="button" onClick={() => void handleOpenPost()}>
        <div className="carousel-media">
          {post.imageUrl ? <img className="carousel-image" src={post.imageUrl} alt={post.imageAlt || post.title} /> : null}

          <div className="carousel-badges">
            <span className="carousel-overlay-badge">{post.category}</span>
          </div>
        </div>

        <div className="carousel-card-body">
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
      </button>

      <div className="carousel-card-footer">
        <div className="carousel-metrics">
          <button
            className={`carousel-metric-button${liked ? ' is-active' : ''}${liked ? ' tooltip-trigger' : ''}`}
            type="button"
            onClick={() => void onLike()}
            data-tooltip={liked ? 'Você já deu like' : undefined}
          >
            <Heart size={14} />
            {post.likes}
          </button>
          <button
            className={`carousel-metric-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
            type="button"
            onClick={() => void handleOpenPost()}
            data-tooltip={viewed ? 'Esse post já foi visualizado' : undefined}
          >
            <Eye size={14} />
            {post.views}
          </button>
          <button className="carousel-metric-button" type="button" onClick={onShare}>
            <Share2 size={14} />
            {post.shares}
          </button>
        </div>
      </div>
    </>
  )
}

function StackCard({ stack }: { stack: StackItem }) {
  return (
    <>
      <div className="carousel-media">
        <StackLogo name={stack.name} imageUrl={stack.imageUrl} imageAlt={stack.imageAlt} />
      </div>

      <div className="carousel-card-body">
        <h3>{stack.name}</h3>
      </div>
    </>
  )
}

async function handleShare(
  type: 'project' | 'blog',
  item: ProjectItem | BlogPostItem,
  setDashboard: (state: DashboardState) => void,
) {
  const detailPath = type === 'project' ? `/projetos/${item.id}` : `/blog/${item.id}`
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath

  if (type === 'project') {
    setDashboard(await incrementProjectMetric(item.id, 'shares'))
  } else {
    setDashboard(await incrementBlogPostMetric(item.id, 'shares'))
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: item.title,
        text: 'excerpt' in item ? item.excerpt : item.summary,
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
