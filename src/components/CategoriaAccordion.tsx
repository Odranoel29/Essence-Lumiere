import { useState } from 'react'
import type { Categoria } from '../types'
import { ServicoItem } from './ServicoItem'

interface Props {
  categoria: Categoria
  selecionados: string[]
  onToggle: (id: string) => void
  busca: string
}

export function CategoriaAccordion({ categoria, selecionados, onToggle, busca }: Props) {
  const [open, setOpen] = useState(true)

  const servicosFiltrados = categoria.servicos.filter(s =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  )

  if (servicosFiltrados.length === 0 && busca) return null

  return (
    <div className="categoria-card">
      <div className="categoria-header" onClick={() => setOpen(!open)}>
        <span className="categoria-nome">{categoria.nome}</span>
        <svg className={`categoria-chevron ${open ? 'open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
      <div className={`categoria-servicos ${open ? 'open' : ''}`}>
        <div className="servicos-list">
          {servicosFiltrados.map(s => (
            <ServicoItem
              key={s.id}
              servico={s}
              selecionado={selecionados.includes(s.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
