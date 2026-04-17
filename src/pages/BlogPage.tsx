import { Eye, Heart, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDashboardInteractions,
  getDashboardState,
  getEmptyDashboardState,
  incrementBlogPostMetric,
  likeBlogPostOnce,
  viewBlogPostOnce,
} from '../lib/content-store'
import type { BlogPostItem, DashboardState } from '../types/content'

export function BlogPage() {
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
        <span className="eyebrow">BLOG</span>
        <h1>Todos os posts</h1>
        <p>
          Artigos, anotações e conteúdos publicados no portfólio para mostrar minha forma de
          pensar, construir e documentar projetos web.
        </p>
      </section>

      <section className="catalog-grid">
        {dashboard.blogPosts.map((post) => (
          <BlogCatalogCard
            key={post.id}
            post={post}
            liked={interactions.blogLikes.includes(post.id)}
            viewed={interactions.blogViews.includes(post.id)}
            onLike={async () => {
              const result = await likeBlogPostOnce(post.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
            onShare={() => void handleSharePost(post, setDashboard)}
            onView={async () => {
              const result = await viewBlogPostOnce(post.id)
              setDashboard(result.dashboard)
              setInteractions(result.interactions)
            }}
          />
        ))}
      </section>
    </section>
  )
}

function BlogCatalogCard({
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
    <article className="carousel-card catalog-card">
      <button className="carousel-card-link-area" type="button" onClick={() => void handleOpenPost()}>
        <div className="carousel-media">
          {post.imageUrl ? <img className="carousel-image" src={post.imageUrl} alt={post.title} /> : null}

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
            className={`carousel-metric-button${liked ? ' is-active tooltip-trigger' : ''}`}
            type="button"
            onClick={() => void onLike()}
            data-tooltip={liked ? 'Você já deu like' : undefined}
          >
            <Heart size={14} />
            {post.likes}
          </button>
          <button
            className={`carousel-metric-button${viewed ? ' is-active tooltip-trigger' : ''}`}
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
    </article>
  )
}

async function handleSharePost(post: BlogPostItem, setDashboard: (state: DashboardState) => void) {
  const detailPath = `/blog/${post.id}`
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath

  setDashboard(await incrementBlogPostMetric(post.id, 'shares'))

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
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
