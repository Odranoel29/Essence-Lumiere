import { getHorariosDisponiveis, getHorariosOcupados } from '../data/store'

interface Props {
  data: string
  horarioSelecionado: string | null
  onSelect: (h: string) => void
}

const HOJE = new Date().toISOString().slice(0, 10)

function horarioJaPassou(horario: string): boolean {
  const agora = new Date()
  const [h, m] = horario.split(':').map(Number)
  return agora.getHours() > h || (agora.getHours() === h && agora.getMinutes() >= m)
}

export function HorariosDisponiveis({ data, horarioSelecionado, onSelect }: Props) {
  const horarios = getHorariosDisponiveis()
    .filter(h => data !== HOJE || !horarioJaPassou(h))
  const ocupados = getHorariosOcupados(data)

  if (horarios.length === 0) {
    return (
      <div className="horarios-section">
        <h3 className="horarios-titulo">Horários disponíveis</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Nenhum horário configurado para este dia.
        </p>
      </div>
    )
  }

  return (
    <div className="horarios-section">
      <h3 className="horarios-titulo">Horários disponíveis</h3>
      <div className="horarios-grid">
        {horarios.map(h => {
          const ocupado = ocupados.includes(h)
          const selected = h === horarioSelecionado
          return (
            <button
              key={h}
              className={`horario-btn ${ocupado ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => !ocupado && onSelect(h)}
              disabled={ocupado}
            >
              {h}
            </button>
          )
        })}
      </div>
    </div>
  )
}
