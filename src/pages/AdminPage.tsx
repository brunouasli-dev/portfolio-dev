import { useEffect, useState } from 'react'
import { ArrowRight, Boxes, Eye, FileCode2, Heart, Newspaper, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminNav } from '../components/AdminNav'
import { getDashboardState, getEmptyDashboardState } from '../lib/content-store'

export function AdminPage() {
  const [dashboard, setDashboard] = useState(getEmptyDashboardState)

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

  const { projects, blogPosts, stacks } = dashboard
  const totalViews = projects.reduce((accumulator, project) => accumulator + project.views, 0)
  const totalLikes = projects.reduce((accumulator, project) => accumulator + project.likes, 0)
  const totalShares = projects.reduce((accumulator, project) => accumulator + project.shares, 0)

  return (
    <section className="dashboard-shell">
      <AdminNav />

      <div className="stats-grid">
        <article className="stat-card panel">
          <div className="stat-card-icon">
            <Eye size={18} />
          </div>
          <span className="stat-label">Visualizações totais</span>
          <strong className="stat-value">{totalViews}</strong>
        </article>

        <article className="stat-card panel">
          <div className="stat-card-icon">
            <Heart size={18} />
          </div>
          <span className="stat-label">Likes totais</span>
          <strong className="stat-value">{totalLikes}</strong>
        </article>

        <article className="stat-card panel">
          <div className="stat-card-icon">
            <Share2 size={18} />
          </div>
          <span className="stat-label">Compartilhamentos totais</span>
          <strong className="stat-value">{totalShares}</strong>
        </article>
      </div>

      <div className="admin-route-grid">
        <Link className="admin-route-card panel" to="/admin/projects">
          <div className="manager-heading">
            <FileCode2 size={18} />
            <h2>Projetos</h2>
          </div>
          <p>Visualize, adicione ou edite os projetos do portfólio.</p>
          <div className="admin-route-meta">
            <span>{projects.length} cadastrado(s)</span>
            <ArrowRight size={18} />
          </div>
        </Link>

        <Link className="admin-route-card panel" to="/admin/blog">
          <div className="manager-heading">
            <Newspaper size={18} />
            <h2>Blog</h2>
          </div>
          <p>Gerencie os posts publicados e os rascunhos do blog.</p>
          <div className="admin-route-meta">
            <span>{blogPosts.length} cadastrado(s)</span>
            <ArrowRight size={18} />
          </div>
        </Link>

        <Link className="admin-route-card panel" to="/admin/habilidades">
          <div className="manager-heading">
            <Boxes size={18} />
            <h2>Habilidades</h2>
          </div>
          <p>Cadastre as habilidades com imagem e link para alimentar a home.</p>
          <div className="admin-route-meta">
            <span>{stacks.length} cadastrado(s)</span>
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </section>
  )
}
