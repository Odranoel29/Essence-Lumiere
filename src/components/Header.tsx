import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  children?: ReactNode
}

export function Header({ title, onMenuClick, children }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-top">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Abrir menu">
          <span className="hamburger" />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      {children && <div className="header-children">{children}</div>}
    </header>
  )
}
