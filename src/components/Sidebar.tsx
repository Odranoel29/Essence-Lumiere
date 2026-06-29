import { NavLink } from 'react-router-dom'
import { getUser } from '../data/store'

const menuItems = [
  { id: 'dashboard', title: 'Meus Agendamentos', icon: '📅', route: '/agendamentos' },
  { id: 'establishments', title: 'Estabelecimentos', icon: '🏪', route: '/estabelecimentos' },
  { id: 'privacy', title: 'Política de Privacidade', icon: '📄', route: '/politica-de-privacidade' },
  { id: 'about', title: 'Conheça o Essence', icon: 'ℹ️', route: '/sobre' },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const user = getUser()

  return (
    <>
      <div className="sidebar-logo">
        <span className="logo-icon">📋</span>
        <span className="logo-text">Essence Agenda</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.id}
            to={item.route}
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-title">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-email">{user.email}</span>
        </div>
      </div>
    </>
  )
}
