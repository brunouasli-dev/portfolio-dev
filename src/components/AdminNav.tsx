import { Boxes, FileCode2, LayoutGrid, LogOut, Newspaper } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

const navItems = [
  { to: '/admin', label: 'Painel', icon: LayoutGrid },
  { to: '/admin/projetos', label: 'Projetos', icon: FileCode2 },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
  { to: '/admin/habilidades', label: 'Habilidades', icon: Boxes },
]

export function AdminNav() {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <div className="admin-nav panel">
      <div className="admin-nav-links">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/admin'
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

          return (
            <Link
              key={item.to}
              className={`admin-nav-link${isActive ? ' is-active' : ''}`}
              to={item.to}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="admin-nav-actions">
        <button className="button-secondary" type="button" onClick={logout}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )
}
