import type { Servico } from '../types'

interface Props {
  servico: Servico
  selecionado: boolean
  onToggle: (id: string) => void
}

export function ServicoItem({ servico, selecionado, onToggle }: Props) {
  return (
    <div
      className={`servico-item ${selecionado ? 'selecionado' : ''}`}
      onClick={() => onToggle(servico.id)}
    >
      <div className="servico-checkbox">
        {selecionado && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className="servico-info">
        <div className="servico-nome">{servico.nome}</div>
        <div className="servico-detalhes">
          {servico.duracao} • {servico.valorStr}
        </div>
      </div>
    </div>
  )
}
