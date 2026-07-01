import { isDiaDisponivel, isDiaAtivo, isDataNoPassado } from '../data/store'

interface Props {
  mes: number
  ano: number
  diaSelecionado: number | null
  onSelect: (dia: number) => void
  onMesAnterior: () => void
  onProximoMes: () => void
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function diasNoMes(mes: number, ano: number) {
  return new Date(ano, mes + 1, 0).getDate()
}

function primeiroDiaSemana(mes: number, ano: number) {
  return new Date(ano, mes, 1).getDay()
}

export function Calendario({ mes, ano, diaSelecionado, onSelect, onMesAnterior, onProximoMes }: Props) {
  const totalDias = diasNoMes(mes, ano)
  const primeiroDia = primeiroDiaSemana(mes, ano)
  const hoje = new Date()
  const hojeStr = `${hoje.getDate()}-${hoje.getMonth()}-${hoje.getFullYear()}`

  const dias: (number | null)[] = []
  for (let i = 0; i < primeiroDia; i++) dias.push(null)
  for (let i = 1; i <= totalDias; i++) dias.push(i)

  return (
    <div className="calendario-section">
      <div className="calendario-header">
        <span className="calendario-mes">{meses[mes]} {ano}</span>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={onMesAnterior}>‹</button>
          <button className="cal-nav-btn" onClick={onProximoMes}>›</button>
        </div>
      </div>

      <div className="cal-grid">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="cal-dia-semana">{d}</div>
        ))}
        {dias.map((dia, i) => {
          if (dia === null) return <div key={`e${i}`} className="cal-dia empty" />
          const dataStr = `${dia}-${mes}-${ano}`
          const isHoje = dataStr === hojeStr
          const isSelected = dia === diaSelecionado
          const disponivel = isDiaDisponivel(dia, mes, ano)
          const passado = isDataNoPassado(dia, mes, ano)

          return (
            <button
              key={dia}
              className={`cal-dia ${!disponivel ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isHoje ? 'today' : ''}`}
              onClick={() => disponivel && onSelect(dia)}
              disabled={!disponivel}
              title={!disponivel ? (passado ? 'Data já passou' : 'Indisponível') : ''}
            >
              {dia}
            </button>
          )
        })}
      </div>
    </div>
  )
}
