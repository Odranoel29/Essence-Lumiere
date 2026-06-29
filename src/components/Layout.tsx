import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/agendamentos': 'Meus Agendamentos',
  '/estabelecimentos': 'Estabelecimentos',
  '/politica-de-privacidade': 'Política de Privacidade',
  '/sobre': 'Conheça o Essence Lumiere',
}

interface LayoutProps {
  children: ReactNode
  headerChildren?: ReactNode
}

export function Layout({ children, headerChildren }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[location.pathname] ?? 'Essence Lumiere'

  return (
    <div className="app-layout">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      <main className="main-content">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)}>
          {headerChildren}
        </Header>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}
