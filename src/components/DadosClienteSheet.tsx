import { useState } from 'react'
import type { Servico } from '../types'
import { formatarTempoTotal } from '../data/store'

interface Props {
  servicos: Servico[]
  profissional: string
  data: string
  horario: string
  onConfirmar: (nome: string, telefone: string) => void
  onVoltar: () => void
}

function formatarData(dataStr: string) {
  const [ano, mes, dia] = dataStr.split('-')
  const d = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return `${dias[d.getDay()]}, ${dia}/${mes}/${ano}`
}

function formatTelefone(valor: string) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return `(${nums}`
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

export function DadosClienteSheet({ servicos, profissional, data, horario, onConfirmar, onVoltar }: Props) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')

  const valorTotal = servicos.reduce((s, srv) => s + srv.valor, 0)
  const tempoTotal = servicos.reduce((s, srv) => s + srv.duracaoMin, 0)

  function handleConfirmar() {
    if (!nome.trim()) {
      setErro('Informe seu nome')
      return
    }
    const telLimpo = telefone.replace(/\D/g, '')
    if (telLimpo.length < 10) {
      setErro('Informe um telefone válido com DDD')
      return
    }
    setErro('')
    onConfirmar(nome.trim(), telLimpo)
  }

  return (
    <>
      <div className="overlay" onClick={onVoltar} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <h2 className="sheet-titulo">Seus Dados</h2>
          <button className="sheet-close" onClick={onVoltar}>✕</button>
        </div>

        <div style={{ background: 'var(--primary-bg)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            {servicos.length === 1 ? servicos[0].nome : `${servicos[0].nome} (+${servicos.length - 1})`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {formatarData(data)} às {horario} • {formatarTempoTotal(tempoTotal)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            R$ {valorTotal.toFixed(2).replace('.', ',')} • Com {profissional}
          </div>
        </div>

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Nome completo <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={e => { setNome(e.target.value); setErro('') }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1px solid ${erro && !nome.trim() ? '#EF4444' : 'var(--border)'}`,
            fontSize: 15, fontFamily: 'inherit', marginBottom: 16, outline: 'none',
          }}
          autoFocus
        />

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Telefone / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="tel"
          placeholder="(11) 99999-8888"
          value={telefone}
          onChange={e => { setTelefone(formatTelefone(e.target.value)); setErro('') }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1px solid ${erro && telefone.replace(/\D/g, '').length < 10 ? '#EF4444' : 'var(--border)'}`,
            fontSize: 15, fontFamily: 'inherit', marginBottom: 12, outline: 'none',
          }}
        />
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          Usado apenas para contato sobre o agendamento
        </p>

        {erro && (
          <div style={{
            padding: '10px 14px', background: '#FEE2E2', color: '#991B1B',
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>
            {erro}
          </div>
        )}

        <button className="btn-primary" onClick={handleConfirmar}>
          Continuar para Confirmação
        </button>
        <button className="btn-cancelar" onClick={onVoltar}>
          Voltar
        </button>
      </div>
    </>
  )
}
