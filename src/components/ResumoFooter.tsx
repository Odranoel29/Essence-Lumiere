import type { Servico } from '../types'
import { formatarTempoTotal } from '../data/store'

interface Props {
  selecionados: Servico[]
  onClick: () => void
  visivel: boolean
}

export function ResumoFooter({ selecionados, onClick, visivel }: Props) {
  const qtd = selecionados.length
  const valorTotal = selecionados.reduce((sum, s) => sum + s.valor, 0)
  const tempoTotal = selecionados.reduce((sum, s) => sum + s.duracaoMin, 0)

  return (
    <div className={`footer-fixo ${visivel && qtd > 0 ? '' : 'hidden'}`}>
      <div className="footer-resumo">
        <span className="footer-qtd">{qtd} serviço{qtd > 1 ? 's' : ''} selecionado{qtd > 1 ? 's' : ''}</span>
        <div className="footer-total">
          <div className="footer-total-valor">Total: R$ {valorTotal.toFixed(2).replace('.', ',')}</div>
          <div className="footer-total-tempo">• {formatarTempoTotal(tempoTotal)}</div>
        </div>
      </div>
      <button className="btn-primary" onClick={onClick}>
        Próximo
      </button>
    </div>
  )
}
