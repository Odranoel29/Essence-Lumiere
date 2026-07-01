import { useState, useMemo, useCallback } from 'react'
import type { Tela, Servico } from '../types'
import { getCategorias, getProfissional, formatarTempoTotal, salvarAgendamento, gerarPin, getSessao } from '../data/store'
import { ProfissionalHeader } from '../components/ProfissionalHeader'
import { AcoesRapidas } from '../components/AcoesRapidas'
import { BuscaServicos } from '../components/BuscaServicos'
import { CategoriaAccordion } from '../components/CategoriaAccordion'
import { ResumoFooter } from '../components/ResumoFooter'
import { AuthSheet } from '../components/AuthSheet'
import { Calendario } from '../components/Calendario'
import { HorariosDisponiveis } from '../components/HorariosDisponiveis'
import { ConfirmacaoSheet } from '../components/ConfirmacaoSheet'
import { SucessoSheet } from '../components/SucessoSheet'
import { AdminPanel } from '../components/AdminPanel'
import { MeusAgendamentos } from '../components/MeusAgendamentos'

export function AgendamentoFlow() {
  const [tela, setTela] = useState<Tela>('servicos')
  const [busca, setBusca] = useState('')
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([])
  const [mes, setMes] = useState(new Date().getMonth())
  const [ano, setAno] = useState(new Date().getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null)
  const [adminAberto, setAdminAberto] = useState(false)
  const [key, setKey] = useState(0)
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [pinCliente, setPinCliente] = useState('')

  const profissional = getProfissional()
  const categorias = getCategorias()

  const servicos = useMemo(() => {
    const todos = categorias.flatMap(c => c.servicos)
    const map = new Map(todos.map(s => [s.id, s]))
    return servicosSelecionados.map(id => map.get(id)).filter(Boolean) as Servico[]
  }, [servicosSelecionados, categorias])

  const toggleServico = useCallback((id: string) => {
    setServicosSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const dataFormatada = diaSelecionado
    ? `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}`
    : ''

  const handleAuth = useCallback(() => {
    const sessao = getSessao()
    if (sessao) {
      setNomeCliente(sessao.nome)
      setTelefoneCliente(sessao.telefone)
      setEmailCliente(sessao.email)
    }
    setTela('calendario')
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (!horarioSelecionado || !dataFormatada || servicos.length === 0) return
    const pin = gerarPin()
    setPinCliente(pin)
    await salvarAgendamento({
      servicos,
      profissional: profissional.nome,
      data: dataFormatada,
      horario: horarioSelecionado,
      valorTotal: servicos.reduce((s, sv) => s + sv.valor, 0),
      tempoTotal: servicos.reduce((s, sv) => s + sv.duracaoMin, 0),
      nomeCliente,
      telefoneCliente,
      emailCliente,
      pinCliente: pin,
    })
    setTela('sucesso')
  }, [horarioSelecionado, dataFormatada, servicos, profissional, nomeCliente, telefoneCliente])

  const handleNovoAgendamento = useCallback(() => {
    setServicosSelecionados([])
    setDiaSelecionado(null)
    setHorarioSelecionado(null)
    setMes(new Date().getMonth())
    setAno(new Date().getFullYear())
    setBusca('')
    setNomeCliente('')
    setTelefoneCliente('')
    setEmailCliente('')
    setTela('servicos')
  }, [])

  const handleFecharAdmin = useCallback(() => {
    setAdminAberto(false)
    setKey(k => k + 1)
  }, [])

  return (
    <div className="app-container" key={key}>
      {/* Botões flutuantes */}
      <button
        onClick={() => setTela('meus-agendamentos')}
        style={{
          position: 'fixed', top: 12, right: 60, zIndex: 60,
          width: 40, height: 40, borderRadius: '50%',
          border: 'none', background: 'rgba(0,0,0,0.5)',
          color: 'white', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        title="Meus Agendamentos"
      >
        📋
      </button>
      <button
        onClick={() => setAdminAberto(true)}
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 60,
          width: 40, height: 40, borderRadius: '50%',
          border: 'none', background: 'rgba(0,0,0,0.5)',
          color: 'white', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        title="Administrar agenda"
      >
        ⚙
      </button>

      {/* Timeline */}
      {tela !== 'servicos' && (
        <div className="timeline">
          <div className="timeline-dot active" />
          <div className={`timeline-dot ${tela === 'calendario' || tela === 'confirmacao' || tela === 'sucesso' ? 'active' : ''}`} />
          <div className={`timeline-dot ${tela === 'confirmacao' || tela === 'sucesso' ? 'active' : ''}`} />
          <div className={`timeline-dot ${tela === 'sucesso' ? 'active' : ''}`} />
        </div>
      )}

      {/* Tela 1: Serviços */}
      {tela === 'servicos' && (
        <div className="page-enter">
          <ProfissionalHeader />
          <AcoesRapidas onAgendar={() => {
            if (servicosSelecionados.length > 0 || true) setTela('autenticacao')
          }} />
          <div className="content-pad">
            <BuscaServicos valor={busca} onChange={setBusca} />
            {categorias.map(cat => (
              <CategoriaAccordion
                key={cat.id}
                categoria={cat}
                selecionados={servicosSelecionados}
                onToggle={toggleServico}
                busca={busca}
              />
            ))}
          </div>
          <ResumoFooter
            selecionados={servicos}
            onClick={() => setTela('autenticacao')}
            visivel={true}
          />
        </div>
      )}

      {/* Autenticação */}
      {tela === 'autenticacao' && (
        <AuthSheet
          onClose={() => setTela('servicos')}
          onAuth={handleAuth}
        />
      )}

      {/* Calendário */}
      {tela === 'calendario' && (
        <div className="page-enter">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setTela('servicos')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text)', padding: 0 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 600 }}>Agendar</h1>
          </div>

          <div className="resumo-card" style={{ margin: '16px 24px' }}>
            <div className="resumo-nome">
              {servicos.length === 1 ? servicos[0].nome : `${servicos[0].nome} (+${servicos.length - 1})`}
            </div>
            <div className="resumo-linha">
              <span>⏱ {formatarTempoTotal(servicos.reduce((s, sv) => s + sv.duracaoMin, 0))}</span>
              <span>💰 R$ {servicos.reduce((s, sv) => s + sv.valor, 0).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="resumo-prof">Com: {profissional.nome}</div>
          </div>

          <Calendario
            mes={mes}
            ano={ano}
            diaSelecionado={diaSelecionado}
            onSelect={setDiaSelecionado}
            onMesAnterior={() => {
              if (mes === 0) { setMes(11); setAno(a => a - 1) }
              else setMes(m => m - 1)
            }}
            onProximoMes={() => {
              if (mes === 11) { setMes(0); setAno(a => a + 1) }
              else setMes(m => m + 1)
            }}
          />

          {diaSelecionado && (
            <div className="data-selecionada">
              📅 Para: {
                (() => {
                  const d = new Date(ano, mes, diaSelecionado)
                  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                  return `${dias[d.getDay()]}, ${String(diaSelecionado).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`
                })()
              }
            </div>
          )}

          {diaSelecionado && (
            <HorariosDisponiveis
              data={dataFormatada}
              horarioSelecionado={horarioSelecionado}
              onSelect={setHorarioSelecionado}
            />
          )}

          <div className="footer-calendario">
            <button
              className="btn-primary"
              disabled={!horarioSelecionado}
              onClick={() => setTela('confirmacao')}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Confirmação */}
      {tela === 'confirmacao' && (
        <ConfirmacaoSheet
          servicos={servicos}
          profissional={profissional.nome}
          data={dataFormatada}
          horario={horarioSelecionado || ''}
          nomeCliente={nomeCliente}
          telefoneCliente={telefoneCliente}
          onConfirmar={handleConfirmar}
          onCancelar={() => setTela('calendario')}
        />
      )}

      {/* Sucesso */}
      {tela === 'sucesso' && (
        <SucessoSheet
          telefoneCliente={telefoneCliente}
          emailCliente={emailCliente}
          pinCliente={pinCliente}
          onNovoAgendamento={handleNovoAgendamento}
          onVerAgendamentos={() => setTela('meus-agendamentos')}
        />
      )}

      {/* Meus Agendamentos */}
      {tela === 'meus-agendamentos' && (
        <MeusAgendamentos
          onFechar={() => setTela('servicos')}
          onReagendar={(servicosParaReagendar) => {
            setServicosSelecionados(servicosParaReagendar.map(s => s.id))
            setTela('calendario')
          }}
        />
      )}

      {/* Admin Panel */}
      {adminAberto && (
        <AdminPanel onFechar={handleFecharAdmin} />
      )}
    </div>
  )
}
