interface Props {
  valor: string
  onChange: (v: string) => void
}

export function BuscaServicos({ valor, onChange }: Props) {
  return (
    <div className="busca-wrapper">
      <span className="busca-icon">🔍</span>
      <input
        className="busca-input"
        type="text"
        placeholder="Qual o serviço procurado?"
        value={valor}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
