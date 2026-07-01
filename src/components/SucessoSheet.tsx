import { getProfissional } from '../data/store'

interface Props {
  telefoneCliente: string
  emailCliente: string
  pinCliente: string
  onNovoAgendamento: () => void
  onVerAgendamentos: () => void
}

export function SucessoSheet({ emailCliente, pinCliente, onNovoAgendamento, onVerAgendamentos }: Props) {
  const p = getProfissional()

  return (
    <>
      <div className="overlay" />
      <div className="bottom-sheet">
        <div className="sucesso-container">
          <div className="sucesso-icon">✓</div>
          <h2 className="sucesso-titulo">Agendamento realizado com sucesso!</h2>
          <p className="sucesso-sub">Você receberá um lembrete próximo da data.</p>

          {/* Confirmação por e-mail */}
          <div style={{
            background: '#ECFDF5', border: '1px solid #D1FAE5',
            borderRadius: 12, padding: '10px 16px', marginBottom: 16,
            width: '100%', fontSize: 13, color: '#065F46',
          }}>
            📧 Confirmação enviada para <strong>{emailCliente}</strong>
          </div>

          {/* PIN de acesso */}
          <div style={{
            background: '#FEF3C7', border: '2px dashed #D4A15A',
            borderRadius: 12, padding: '12px 20px', marginBottom: 20,
            width: '100%',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
              🔑 SEU CÓDIGO DE ACESSO
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#92400E', letterSpacing: 6 }}>
              {pinCliente}
            </div>
            <div style={{ fontSize: 11, color: '#92400E', marginTop: 4 }}>
              Guarde este código. Você também pode acessar fazendo login novamente.
            </div>
          </div>

          <button
            className="acao-pos-card"
            onClick={() => {
              window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Essence+Lumiere', '_blank')
            }}
          >
            <span className="acao-pos-icon">📅</span>
            Adicionar ao Google Calendar
          </button>

          <a
            href={`https://wa.me/${p.whatsapp}?text=Olá! Agendei um horário pelo app. Meu código é ${pinCliente}`}
            target="_blank"
            rel="noopener noreferrer"
            className="acao-pos-card"
          >
            <span className="acao-pos-icon">💬</span>
            Falar com {p.nome.split(' ')[0]}
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(p.endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="acao-pos-card"
          >
            <span className="acao-pos-icon">📍</span>
            Ver no Google Maps
          </a>

          <button className="acao-pos-card" onClick={onVerAgendamentos}>
            <span className="acao-pos-icon">📋</span>
            Meus Agendamentos
          </button>

          <button className="acao-pos-card" onClick={onNovoAgendamento}>
            <span className="acao-pos-icon">🔄</span>
            Agendar outro serviço
          </button>
        </div>
      </div>
    </>
  )
}
