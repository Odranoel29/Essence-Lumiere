import type { Servico } from '../types'
import { formatarTempoTotal, getProfissional } from '../data/store'

interface Props {
  servicos: Servico[]
  profissional: string
  data: string
  horario: string
  nomeCliente: string
  telefoneCliente: string
  onConfirmar: () => void
  onCancelar: () => void
}

function formatarData(dataStr: string) {
  const [ano, mes, dia] = dataStr.split('-')
  const d = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return `${diasSemana[d.getDay()]}, ${dia}/${mes}/${ano}`
}

export function ConfirmacaoSheet({ servicos, profissional, data, horario, nomeCliente, telefoneCliente, onConfirmar, onCancelar }: Props) {
  const valorTotal = servicos.reduce((s, srv) => s + srv.valor, 0)
  const tempoTotal = servicos.reduce((s, srv) => s + srv.duracaoMin, 0)
  const p = getProfissional()

  return (
    <>
      <div className="overlay" onClick={onCancelar} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <h2 className="sheet-titulo">Confirmar Agendamento</h2>
          <button className="sheet-close" onClick={onCancelar}>✕</button>
        </div>

        <div className="confirmacao-grid">
          <span className="confirmacao-label">🙋 Cliente</span>
          <span className="confirmacao-valor">{nomeCliente}</span>

          <span className="confirmacao-label">📱 Telefone</span>
          <span className="confirmacao-valor">{telefoneCliente}</span>

          <span className="confirmacao-label">👤 Profissional</span>
          <span className="confirmacao-valor">{profissional}</span>

          <span className="confirmacao-label">💇 Serviço</span>
          <span className="confirmacao-valor">
            {servicos.length === 1 ? servicos[0].nome : `${servicos[0].nome} (+${servicos.length - 1})`}
          </span>

          <span className="confirmacao-label">💰 Valor Total</span>
          <span className="confirmacao-valor">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>

          <span className="confirmacao-label">📅 Data</span>
          <span className="confirmacao-valor">{formatarData(data)}</span>

          <span className="confirmacao-label">⏰ Horário</span>
          <span className="confirmacao-valor">{horario}</span>

          <span className="confirmacao-label">⏱ Tempo Total</span>
          <span className="confirmacao-valor">{formatarTempoTotal(tempoTotal)}</span>

          <span className="confirmacao-label">📍 Local</span>
          <span className="confirmacao-valor">{p.endereco}</span>
        </div>

        <button className="btn-primary" onClick={onConfirmar}>
          Confirmar Agendamento
        </button>
        <button className="btn-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </>
  )
}
