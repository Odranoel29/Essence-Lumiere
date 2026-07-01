import { useState } from 'react'
import { loginCliente } from '../data/store'

interface Props {
  onClose: () => void
  onAuth: () => void
}

function formatTelefone(valor: string) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return `(${nums}`
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

export function AuthSheet({ onClose, onAuth }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')

  function handleLogin() {
    if (!nome.trim()) {
      setErro('Informe seu nome')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErro('Informe um e-mail válido')
      return
    }
    const telLimpo = telefone.replace(/\D/g, '')
    if (telLimpo.length < 10) {
      setErro('Informe um telefone válido com DDD')
      return
    }
    setErro('')
    loginCliente(email, telLimpo, nome.trim())
    onAuth()
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <div>
            <h2 className="sheet-titulo">Faça login para agendar</h2>
            <p className="sheet-subtitulo">Seus dados para identificação</p>
          </div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Nome completo
        </label>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={e => { setNome(e.target.value); setErro('') }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 15,
            fontFamily: 'inherit', marginBottom: 16, outline: 'none',
          }}
          autoFocus
        />

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          E-mail
        </label>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setErro('') }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 15,
            fontFamily: 'inherit', marginBottom: 16, outline: 'none',
          }}
        />

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Telefone / WhatsApp
        </label>
        <input
          type="tel"
          placeholder="(11) 99999-8888"
          value={telefone}
          onChange={e => { setTelefone(formatTelefone(e.target.value)); setErro('') }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 15,
            fontFamily: 'inherit', marginBottom: 20, outline: 'none',
          }}
        />

        {erro && (
          <div style={{
            padding: '10px 14px', background: '#FEE2E2', color: '#991B1B',
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>
            {erro}
          </div>
        )}

        <button className="btn-primary" onClick={handleLogin}>
          Entrar
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>
          🔒 Seus dados são usados apenas para identificar seus agendamentos
        </p>
      </div>
    </>
  )
}
