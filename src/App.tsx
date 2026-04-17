import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Download, House, LogOut, PanelTopOpen, UserRound, Menu, FolderCode, Boxes, Newspaper, Mail } from 'lucide-react'
import { Terminal } from './components/animate-ui/icons/terminal'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminPage } from './pages/AdminPage'
import { AdminBlogPage } from './pages/AdminBlogPage'
import { AdminProjectsPage } from './pages/AdminProjectsPage'
import { AdminStacksPage } from './pages/AdminStacksPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostDetailPage } from './pages/BlogPostDetailPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { StacksPage } from './pages/StacksPage'
import { siteProfile } from './lib/site-profile'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="projects" element={<Navigate to="/projetos" replace />} />
            <Route path="projects/:projectId" element={<Navigate to="/projetos" replace />} />
            <Route path="projetos" element={<ProjectsPage />} />
            <Route path="projetos/:projectId" element={<ProjectDetailPage />} />
            <Route path="stacks" element={<Navigate to="/habilidades" replace />} />
            <Route path="habilidades" element={<StacksPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:postId" element={<BlogPostDetailPage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/projects"
              element={<Navigate to="/admin/projetos" replace />}
            />
            <Route
              path="admin/projetos"
              element={
                <ProtectedRoute>
                  <AdminProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/blog"
              element={
                <ProtectedRoute>
                  <AdminBlogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/habilidades"
              element={
                <ProtectedRoute>
                  <AdminStacksPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function SiteLayout() {
  const { logout, session } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const year = new Date().getFullYear()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const element = document.querySelector(location.hash)

    if (!element) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [location.hash, location.pathname])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const activeMenuRef = session ? profileMenuRef.current : mobileMenuRef.current

      if (activeMenuRef && !activeMenuRef.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)

    // Lock scroll when flayout menu is open (mobile)
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      document.body.style.overflow = ''
    }
  }, [menuOpen, session])

  useEffect(() => {
    let lastScrollY = window.scrollY

    function handleScroll() {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY

      if (currentScrollY <= 24) {
        setIsHeaderHidden(false)
        lastScrollY = currentScrollY
        return
      }

      if (delta > 6 && currentScrollY > 120) {
        setIsHeaderHidden(true)
      } else if (delta < -6) {
        setIsHeaderHidden(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setIsHeaderHidden(false)
  }, [location.pathname, location.hash])

  return (
    <div className="site-shell">
      <header className={`site-header${isHeaderHidden ? ' is-hidden' : ''}`}>
        <Link className="brand" to="/">
          <div className="brand-mark">
            <Terminal className="brand-mark-icon" size={18} animate loop loopDelay={350} />
          </div>
          <div className="brand-copy">
            <strong>{siteProfile.fullName}</strong>
            <span>
              {siteProfile.role} <span className="brand-accent">{siteProfile.roleHighlight}</span>
            </span>
          </div>
        </Link>

        {session ? (
          <div ref={profileMenuRef} className={`profile-menu${menuOpen ? ' is-open' : ''}`}>
            <button
              className="profile-menu-trigger"
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Abrir menu do perfil"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <UserRound size={18} />
            </button>

            <div className="profile-menu-dropdown" role="menu" aria-label="Menu do perfil">
              <div className="profile-menu-meta">
                <strong>{siteProfile.fullName}</strong>
                <span>{session.email}</span>
              </div>

              <Link
                className={location.pathname === '/' ? 'is-active' : ''}
                to="/"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <House size={15} />
                Home
              </Link>
              <Link
                className={location.pathname === '/projetos' ? 'is-active' : ''}
                to="/projetos"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <FolderCode size={15} />
                Projetos
              </Link>
              <Link
                className={location.pathname === '/habilidades' ? 'is-active' : ''}
                to="/habilidades"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Boxes size={15} />
                Habilidades
              </Link>
              <Link
                className={location.pathname === '/blog' ? 'is-active' : ''}
                to="/blog"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Newspaper size={15} />
                Blog
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#contato' ? 'is-active' : ''}
                to="/#contato"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Mail size={15} />
                Contato
              </Link>
              <Link
                className={location.pathname.startsWith('/admin') ? 'is-active' : ''}
                to="/admin"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <PanelTopOpen size={15} />
                Admin
              </Link>
              <a
                href={siteProfile.resumePath}
                download
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Download size={15} />
                Baixar CV
              </a>
              <button
                className="profile-menu-logout"
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  void logout()
                }}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          </div>
        ) : (
          <div ref={mobileMenuRef} className="site-mobile-menu">
            <button
              className="site-menu-trigger"
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <Menu size={22} />
            </button>
            <nav
              className={`site-flayout-menu${menuOpen ? ' is-open' : ''}`}
              role="menu"
              aria-label="Menu principal"
            >
              <button
                className="site-flayout-close"
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
              <Link
                className={location.pathname === '/' && !location.hash ? 'is-active' : ''}
                to="/"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#sobre' ? 'is-active' : ''}
                to="/#sobre"
                onClick={() => setMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#atuacao' ? 'is-active' : ''}
                to="/#atuacao"
                onClick={() => setMenuOpen(false)}
              >
                Atuação
              </Link>
              <Link
                className={location.pathname === '/projetos' ? 'is-active' : ''}
                to="/projetos"
                onClick={() => setMenuOpen(false)}
              >
                Projeto
              </Link>
              <Link
                className={location.pathname === '/habilidades' ? 'is-active' : ''}
                to="/habilidades"
                onClick={() => setMenuOpen(false)}
              >
                Habilidade
              </Link>
              <Link
                className={location.pathname === '/blog' ? 'is-active' : ''}
                to="/blog"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#contato' ? 'is-active' : ''}
                to="/#contato"
                onClick={() => setMenuOpen(false)}
              >
                Contato
              </Link>
              <a
                className="site-flayout-download"
                href={siteProfile.resumePath}
                download
                onClick={() => setMenuOpen(false)}
              >
                Baixar CV <Download size={15} />
              </a>
            </nav>
            <nav className="site-nav" aria-label="Principal">
              {/* O menu desktop só deve aparecer em telas >=1200px, controlado pelo CSS */}
              <Link
                className={location.pathname === '/' && !location.hash ? 'is-active' : ''}
                to="/"
              >
                Home
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#sobre' ? 'is-active' : ''}
                to="/#sobre"
              >
                Sobre
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#atuacao' ? 'is-active' : ''}
                to="/#atuacao"
              >
                Atuação
              </Link>
              <Link className={location.pathname === '/projetos' ? 'is-active' : ''} to="/projetos">
                Projeto
              </Link>
              <Link className={location.pathname === '/habilidades' ? 'is-active' : ''} to="/habilidades">
                Habilidade
              </Link>
              <Link className={location.pathname === '/blog' ? 'is-active' : ''} to="/blog">
                Blog
              </Link>
              <Link
                className={location.pathname === '/' && location.hash === '#contato' ? 'is-active' : ''}
                to="/#contato"
              >
                Contato
              </Link>
              <a className="site-nav-download" href={siteProfile.resumePath} download>
                Baixar CV
                <Download size={15} />
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>© {year} {siteProfile.fullName}. Todos os direitos reservados.</span>
        <small>{siteProfile.brandTagline}.</small>
      </footer>
    </div>
  )
}

export default App
