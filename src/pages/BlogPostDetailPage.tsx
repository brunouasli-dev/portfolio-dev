import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, Heart, Share2 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getDashboardInteractions,
  getEmptyDashboardState,
  incrementBlogPostMetric,
  likeBlogPostOnce,
  viewBlogPostOnce,
} from '../lib/content-store'

export function BlogPostDetailPage() {
  const { postId } = useParams()

  if (!postId) {
    return <Navigate to="/" replace />
  }

  return <BlogPostDetailContent key={postId} postId={postId} />
}

function BlogPostDetailContent({ postId }: { postId: string }) {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(getEmptyDashboardState)
  const [interactions, setInteractions] = useState(() => getDashboardInteractions())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPost() {
      const result = await viewBlogPostOnce(postId)

      if (!active) {
        return
      }

      setDashboard(result.dashboard)
      setInteractions(result.interactions)
      setReady(true)
    }

    void loadPost()

    return () => {
      active = false
    }
  }, [postId])

  if (!ready) {
    return <div className="panel loading-panel">Carregando post...</div>
  }

  const post = dashboard.blogPosts.find((item) => item.id === postId) ?? null
  const relatedPosts = dashboard.blogPosts.filter((item) => item.id !== postId).slice(0, 4)

  if (!post) {
    return <Navigate to="/" replace />
  }

  const currentPost = post
  const excerpt = currentPost.excerpt.trim()
  const content =
    excerpt && currentPost.content.trim().startsWith(excerpt)
      ? currentPost.content.trim().slice(excerpt.length).trim()
      : currentPost.content

  const liked = interactions.blogLikes.includes(currentPost.id)
  const viewed = interactions.blogViews.includes(currentPost.id)

  async function handleShare() {
    const detailPath = `/blog/${currentPost.id}`
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath
    const nextDashboard = await incrementBlogPostMetric(currentPost.id, 'shares')
    setDashboard(nextDashboard)

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.excerpt,
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
    const result = await likeBlogPostOnce(currentPost.id)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
  }

  async function handleOpenRelatedPost(nextPostId: string) {
    const result = await viewBlogPostOnce(nextPostId)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
    navigate(`/blog/${nextPostId}`)
  }

  async function handleRelatedLike(nextPostId: string) {
    const result = await likeBlogPostOnce(nextPostId)
    setDashboard(result.dashboard)
    setInteractions(result.interactions)
  }

  async function handleRelatedShare(nextPostId: string) {
    const relatedPost = dashboard.blogPosts.find((item) => item.id === nextPostId)

    if (!relatedPost) {
      return
    }

    const detailPath = `/blog/${relatedPost.id}`
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath
    const nextDashboard = await incrementBlogPostMetric(relatedPost.id, 'shares')
    setDashboard(nextDashboard)

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: relatedPost.title,
          text: relatedPost.excerpt,
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

  return (
    <section className="detail-layout">
      <article className="detail-main detail-main-blog panel">
        <div className="detail-media">
          {currentPost.imageUrl ? (
            <img className="detail-image" src={currentPost.imageUrl} alt={currentPost.title} />
          ) : null}

          <div className="detail-media-overlay">
            <div className="detail-media-actions">
              <button
                className={`detail-media-pill detail-action-button${liked ? ' is-active' : ''}${liked ? ' tooltip-trigger' : ''}`}
                type="button"
                onClick={() => void handleLike()}
                data-tooltip={liked ? 'Você já deu like' : undefined}
              >
                <Heart size={15} />
                {currentPost.likes}
              </button>
              <button
                className={`detail-media-pill detail-action-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
                type="button"
                data-tooltip={viewed ? 'Esse post já foi visualizado' : undefined}
              >
                <Eye size={15} />
                {currentPost.views}
              </button>
              <button className="detail-media-pill detail-action-button" type="button" onClick={() => void handleShare()}>
                <Share2 size={15} />
                {currentPost.shares}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-main-body">
          <div className="detail-topline">
            <Link className="detail-backlink" to="/">
              <ArrowLeft size={16} />
              Voltar
            </Link>
            <span className="eyebrow detail-topline-badge-blog">{currentPost.category}</span>
          </div>

          <header className="detail-header">
            <h1>{currentPost.title}</h1>
            <p className="detail-summary detail-summary-desktop">{currentPost.excerpt}</p>
          </header>

          <div className="detail-article">
            <section className="detail-section">
              <h2>Conteúdo</h2>
              <p>{content}</p>
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
                {currentPost.likes}
              </button>
              <button
                className={`detail-media-pill detail-action-button${viewed ? ' is-active' : ''}${viewed ? ' tooltip-trigger' : ''}`}
                type="button"
                data-tooltip={viewed ? 'Esse post já foi visualizado' : undefined}
              >
                <Eye size={15} />
                {currentPost.views}
              </button>
              <button className="detail-media-pill detail-action-button" type="button" onClick={() => void handleShare()}>
                <Share2 size={15} />
                {currentPost.shares}
              </button>
            </div>
          </footer>
        </div>
      </article>

      <aside className="detail-sidebar panel">
        <div className="detail-sidebar-header">
          <h2>
            Outros posts <span className="detail-accent">relacionados</span>
          </h2>
        </div>

        <div className="detail-sidebar-list">
          {relatedPosts.map((item) => (
            <article key={item.id} className="detail-related-card">
              <button
                className="detail-related-link"
                type="button"
                onClick={() => void handleOpenRelatedPost(item.id)}
              >
                {item.imageUrl ? (
                  <img className="detail-related-image" src={item.imageUrl} alt={item.title} />
                ) : null}
                <div className="detail-related-body">
                  <strong>{item.title}</strong>
                  <p>{item.excerpt}</p>
                </div>
              </button>

              <footer className="detail-related-footer">
                <div className="detail-related-metrics">
                  <button
                    className={`detail-related-action-button${interactions.blogLikes.includes(item.id) ? ' is-active tooltip-trigger' : ''}`}
                    type="button"
                    onClick={() => void handleRelatedLike(item.id)}
                    data-tooltip={interactions.blogLikes.includes(item.id) ? 'Você já deu like' : undefined}
                  >
                    <Heart size={13} />
                    {item.likes}
                  </button>
                  <button
                    className={`detail-related-action-button${interactions.blogViews.includes(item.id) ? ' is-active tooltip-trigger' : ''}`}
                    type="button"
                    onClick={() => void handleOpenRelatedPost(item.id)}
                    data-tooltip={
                      interactions.blogViews.includes(item.id)
                        ? 'Esse post já foi visualizado'
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
  )
}
