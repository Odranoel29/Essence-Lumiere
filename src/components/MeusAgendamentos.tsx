import { useState, useEffect } from 'react'
import { getAgendamentos, cancelarAgendamento, getSessao } from '../data/store'
import type { AgendamentoSalvo } from '../types'

interface Props {
  onFechar: () => void
  onReagendar?: (servicos: AgendamentoSalvo['servicos']) => void
}

export function MeusAgendamentos({ onFechar, onReagendar }: Props) {
  const [telefone, setTelefone] = useState('')
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [buscou, setBuscou] = useState(false)
  const [agendamentos, setAgendamentos] = useState<AgendamentoSalvo[]>([])
  const [usarPin, setUsarPin] = useState(false)

  // Verifica sessão ativa ao abrir
  useEffect(() => {
    const sessao = getSessao()
    if (sessao) {
      const todos = getAgendamentos()
      const filtrados = todos.filter(a => a.telefoneCliente === sessao.telefone)
      if (filtrados.length > 0) {
        setAgendamentos(filtrados.sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario)))
        setBuscou(true)
      }
    }
  }, [])

  function handleBuscar() {
    const telLimpo = telefone.replace(/\D/g, '')

    if (usarPin) {
      if (telLimpo.length < 10) {
        setErro('Informe um telefone válido')
        return
      }
      if (pin.length < 4) {
        setErro('Informe o código PIN de 4 dígitos')
        return
      }

      const todos = getAgendamentos()
      const filtrados = todos.filter(a =>
        a.telefoneCliente === telLimpo && a.pinCliente === pin
      )

      if (filtrados.length === 0) {
        setErro('Nenhum agendamento encontrado. Verifique telefone e PIN.')
        return
      }

      setErro('')
      setAgendamentos(filtrados.sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario)))
      setBuscou(true)
    } else {
      // Buscar por e-mail (para usuários logados que já preencheram)
      if (!telLimpo) {
        setErro('Informe o telefone cadastrado')
        return
      }

      const todos = getAgendamentos()
      const filtrados = todos.filter(a => a.telefoneCliente === telLimpo)

      if (filtrados.length === 0) {
        setErro('Nenhum agendamento encontrado para este telefone.')
        return
      }

      setErro('')
      setAgendamentos(filtrados.sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario)))
      setBuscou(true)
    }
  }

  function handleCancelar(id: string) {
    if (!window.confirm('Cancelar este agendamento?')) return
    cancelarAgendamento(id)
    handleBuscar()
  }

  function formatTelefone(valor: string) {
    const nums = valor.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return `(${nums}`
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }

  const hoje = new Date().toISOString().slice(0, 10)
  const futuros = agendamentos.filter(a => a.data >= hoje)
  const passados = agendamentos.filter(a => a.data < hoje)

  return (
    <>
      <div className="overlay" onClick={onFechar} />
      <div className="bottom-sheet" style={{ maxHeight: '90vh' }}>
        <div className="sheet-header">
          <h2 className="sheet-titulo">📋 Meus Agendamentos</h2>
          <button className="sheet-close" onClick={onFechar}>✕</button>
        </div>

        {!buscou ? (
          <div>
            {!usarPin && getSessao() ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Logado como <strong>{getSessao()?.email}</strong>
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    const sessao = getSessao()
                    if (sessao) {
                      setTelefone(formatTelefone(sessao.telefone))
                      handleBuscar()
                    }
                  }}
                >
                  Ver meus agendamentos
                </button>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
                  <button
                    onClick={() => setUsarPin(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                  >
                    Acessar com código PIN
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Informe seus dados para consultar os agendamentos:
                </p>

                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Telefone cadastrado
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-8888"
                  value={telefone}
                  onChange={e => { setTelefone(formatTelefone(e.target.value)); setErro('') }}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', fontSize: 15,
                    fontFamily: 'inherit', marginBottom: usarPin ? 16 : 20, outline: 'none',
                  }}
                  autoFocus
                />

                {usarPin && (
                  <>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Código PIN (4 dígitos)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000"
                      maxLength={4}
                      value={pin}
                      onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setErro('') }}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        border: '1px solid var(--border)', fontSize: 15,
                        fontFamily: 'monospace', letterSpacing: 6, fontWeight: 700,
                        marginBottom: 20, outline: 'none', textAlign: 'center',
                      }}
                    />
                  </>
                )}

                {erro && (
                  <div style={{
                    padding: '10px 14px', background: '#FEE2E2', color: '#991B1B',
                    borderRadius: 10, fontSize: 13, marginBottom: 16,
                  }}>
                    {erro}
                  </div>
                )}

                <button className="btn-primary" onClick={handleBuscar}>
                  Consultar
                </button>

                {!usarPin && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
                    Esqueceu o código?{' '}
                    <button
                      onClick={() => { setUsarPin(true); setErro('') }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                    >
                      Acessar com PIN
                    </button>
                  </p>
                )}

                {usarPin && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
                    <button
                      onClick={() => { setUsarPin(false); setErro('') }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                    >
                      Voltar ao login
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {agendamentos.length === 0
                ? 'Nenhum agendamento encontrado.'
                : `${agendamentos.length} agendamento${agendamentos.length > 1 ? 's' : ''} encontrado${agendamentos.length > 1 ? 's' : ''}.`
              }
            </p>

            {futuros.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--primary)' }}>
                  📅 Próximos
                </h3>
                {futuros.map(a => (
                  <div key={a.id} style={{
                    background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, marginBottom: 8,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.servicos.map(s => s.nome).join(', ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {a.horario}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Com {a.profissional} • {formatTempo(a.tempoTotal)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => handleCancelar(a.id)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: '1px solid #EF4444',
                          background: 'transparent', color: '#EF4444', fontSize: 12,
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                      {onReagendar && (
                        <button
                          onClick={async () => {
                            await cancelarAgendamento(a.id)
                            onReagendar(a.servicos)
                          }}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: '1px solid var(--primary)',
                            background: 'transparent', color: 'var(--primary)', fontSize: 12,
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Reagendar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {passados.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  ✅ Histórico
                </h3>
                {passados.map(a => (
                  <div key={a.id} style={{
                    background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, marginBottom: 8,
                    opacity: 0.8,
                  }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{a.servicos.map(s => s.nome).join(', ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {a.horario}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Com {a.profissional}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-cancelar" onClick={() => { setBuscou(false); setTelefone(''); setPin(''); setErro('') }} style={{ marginTop: 8 }}>
              Voltar
            </button>
          </>
        )}
      </div>
    </>
  )
}

function formatTempo(min: number) {
  const h = Math.floor(min / 60); const m = min % 60
  if (h > 0 && m > 0) return `${h}h${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}
