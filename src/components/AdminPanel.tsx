import { useState } from 'react'
import {
  getConfigHorarios, salvarConfigHorarios,
  getAgendamentos, cancelarAgendamento,
  getCategorias,
  getProfissional, salvarProfissional,
  adicionarServico, editarServico, removerServico,
  adicionarCategoria, removerCategoria,
  getFotoPerfil, salvarFotoPerfil,
  isAdminAutenticado, setAdminAutenticado,
} from '../data/store'
import { signInAdmin } from '../lib/supabase'
import type { ConfiguracaoHorarios, AgendamentoSalvo, Categoria, Servico, DadosProfissional } from '../types'

interface Props {
  onFechar: () => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AdminPanel({ onFechar }: Props) {
  if (!isAdminAutenticado()) {
    return <AdminLogin onFechar={onFechar} onLogin={() => setAdminAutenticado(true)} />
  }

  return <AdminContent onFechar={onFechar} />
}

function AdminLogin({ onFechar, onLogin }: { onFechar: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) { setErro('Preencha e-mail e senha'); return }
    setLoading(true); setErro('')
    const { error } = await signInAdmin(email, password)
    setLoading(false)
    if (error) { setErro(error.message); return }
    onLogin()
  }

  return (
    <>
      <div className="overlay" onClick={onFechar} />
      <div className="bottom-sheet" style={{ maxHeight: '90vh' }}>
        <div className="sheet-header">
          <h2 className="sheet-titulo">🔐 Acesso Admin</h2>
          <button className="sheet-close" onClick={onFechar}>✕</button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>E-mail</label>
        <input type="email" placeholder="admin@essencelumiere.com" value={email}
          onChange={e => { setEmail(e.target.value); setErro('') }}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 15, fontFamily: 'inherit', marginBottom: 16, outline: 'none' }}
          autoFocus />

        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Senha</label>
        <input type="password" placeholder="••••••••" value={password}
          onChange={e => { setPassword(e.target.value); setErro('') }}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 15, fontFamily: 'inherit', marginBottom: 20, outline: 'none' }} />

        {erro && (
          <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            {erro}
          </div>
        )}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>
          Apenas a administradora tem acesso
        </p>
      </div>
    </>
  )
}

function AdminContent({ onFechar }: { onFechar: () => void }) {
  const [aba, setAba] = useState<'horarios' | 'servicos' | 'perfil' | 'agendamentos'>('horarios')
  const [config, setConfig] = useState<ConfiguracaoHorarios>(getConfigHorarios)
  const [prof, setProf] = useState<DadosProfissional>(getProfissional)
  const [categorias, setCategorias] = useState<Categoria[]>(getCategorias)
  const [salvo, setSalvo] = useState(false)
  const [editandoServico, setEditandoServico] = useState<{ catId: string; servico: Servico } | null>(null)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [foto, setFoto] = useState(getFotoPerfil)

  const agendamentos = getAgendamentos()
    .filter(a => a.data >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario))

  function flashSalvo() {
    setSalvo(true); setTimeout(() => setSalvo(false), 2000)
  }

  async function salvarConfigHandler() {
    await salvarConfigHorarios(config); flashSalvo()
  }

  async function salvarPerfil() {
    await salvarProfissional(prof); flashSalvo()
  }

  function toggleDia(idx: number) {
    const novos = [...config.diasAtivos]
    novos[idx] = !novos[idx]
    setConfig({ ...config, diasAtivos: novos })
  }

  async function handleAdicionarServico(catId: string) {
    const nome = prompt('Nome do serviço:')
    if (!nome) return
    const duracaoMin = parseInt(prompt('Duração (minutos):', '30') || '30')
    const valor = parseFloat(prompt('Valor (R$):', '0')?.replace(',', '.') || '0')
    const s: Servico = {
      id: crypto.randomUUID(),
      nome,
      duracao: duracaoMin >= 60 ? `${Math.floor(duracaoMin / 60)}h${duracaoMin % 60 > 0 ? ` ${duracaoMin % 60}min` : ''}` : `${duracaoMin}min`,
      duracaoMin,
      valor,
      valorStr: `R$ ${valor.toFixed(2).replace('.', ',')}`,
    }
    setCategorias(await adicionarServico(catId, s))
    flashSalvo()
  }

  function handleEditarServico(catId: string, servico: Servico) {
    setEditandoServico({ catId, servico })
  }

  async function salvarEdicaoServico() {
    if (!editandoServico) return
    const { catId, servico } = editandoServico
    const duracaoMin = servico.duracaoMin
    const valor = servico.valor
    setCategorias(await editarServico(catId, servico.id, {
      nome: servico.nome,
      duracao: duracaoMin >= 60 ? `${Math.floor(duracaoMin / 60)}h${duracaoMin % 60 > 0 ? ` ${duracaoMin % 60}min` : ''}` : `${duracaoMin}min`,
      duracaoMin,
      valor,
    }))
    setEditandoServico(null)
    flashSalvo()
  }

  async function handleRemoverServico(catId: string, servicoId: string) {
    if (!window.confirm('Excluir este serviço?')) return
    setCategorias(await removerServico(catId, servicoId))
    flashSalvo()
  }

  async function handleAdicionarCategoria() {
    const nome = prompt('Nome da nova categoria:')
    if (!nome) return
    setCategorias(await adicionarCategoria(nome))
    flashSalvo()
  }

  async function handleRemoverCategoria(id: string) {
    if (!window.confirm('Excluir esta categoria e todos os serviços dela?')) return
    setCategorias(await removerCategoria(id))
    flashSalvo()
  }

  function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      salvarFotoPerfil(url)
      setFoto(url)
      flashSalvo()
    }
    reader.readAsDataURL(file)
  }

  async function handleCancelarAgendamento(id: string) {
    if (!window.confirm('Cancelar este agendamento?')) return
    cancelarAgendamento(id)
    flashSalvo()
    window.location.reload()
  }

  const btnAba = (id: typeof aba, label: string) => (
    <button
      onClick={() => setAba(id)}
      style={{
        flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none',
        background: aba === id ? 'var(--primary)' : 'var(--bg-tertiary)',
        color: aba === id ? 'white' : 'var(--text)',
        fontWeight: 600, fontSize: 11, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="overlay" onClick={onFechar} />
      <div className="bottom-sheet" style={{ maxHeight: '90vh' }}>
        <div className="sheet-header">
          <h2 className="sheet-titulo">⚙ Administrar</h2>
          <button className="sheet-close" onClick={onFechar}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {btnAba('horarios', 'Horários')}
          {btnAba('servicos', 'Serviços')}
          {btnAba('perfil', 'Perfil')}
          {btnAba('agendamentos', `Agend. (${agendamentos.length})`)}
        </div>

        {aba === 'horarios' && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Dias de Atendimento</h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {DIAS_SEMANA.map((dia, idx) => (
                <button key={dia} onClick={() => toggleDia(idx)} style={{
                  padding: '8px 14px', borderRadius: 10, border: 'none',
                  background: config.diasAtivos[idx] ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: config.diasAtivos[idx] ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {dia}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Horário</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Início</label>
                <input type="time" value={config.horaInicio} onChange={e => setConfig({ ...config, horaInicio: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Fim</label>
                <input type="time" value={config.horaFim} onChange={e => setConfig({ ...config, horaFim: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }} />
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Intervalo</h3>
            <select value={config.intervaloMin} onChange={e => setConfig({ ...config, intervaloMin: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 20, fontFamily: 'inherit' }}>
              <option value={30}>30 min</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h30</option>
              <option value={120}>2 horas</option>
            </select>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Datas Bloqueadas</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="date"
                onChange={e => {
                  if (!e.target.value) return
                  setConfig({
                    ...config,
                    datasBloqueadas: [...new Set([...config.datasBloqueadas, e.target.value])].sort(),
                  })
                  e.target.value = ''
                }}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }} />
            </div>
            {config.datasBloqueadas.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {config.datasBloqueadas.map(data => (
                  <span key={data} style={{
                    padding: '4px 10px', borderRadius: 8, background: '#FEE2E2', color: '#991B1B',
                    fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    <button onClick={() => setConfig({ ...config, datasBloqueadas: config.datasBloqueadas.filter(d => d !== data) })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontSize: 14, padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            )}

            <button className="btn-primary" onClick={salvarConfigHandler}>
              {salvo ? '✓ Salvo!' : 'Salvar Horários'}
            </button>
          </>
        )}

        {aba === 'servicos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Categorias e Serviços</h3>
              <button onClick={handleAdicionarCategoria} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: 'var(--bg-tertiary)', color: 'var(--primary)',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>
                + Categoria
              </button>
            </div>

            {categorias.map(cat => (
              <div key={cat.id} style={{ marginBottom: 16, background: 'var(--bg-secondary)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ fontSize: 14 }}>{cat.nome}</strong>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleAdicionarServico(cat.id)} style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                      + Serviço
                    </button>
                    <button onClick={() => handleRemoverCategoria(cat.id)} style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #EF4444',
                      background: 'transparent', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Excluir
                    </button>
                  </div>
                </div>

                {cat.servicos.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', background: 'white', borderRadius: 8, marginBottom: 4,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nome}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.duracao} • {s.valorStr}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleEditarServico(cat.id, s)} style={{
                        padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
                        background: 'transparent', fontSize: 11, cursor: 'pointer',
                      }}>
                        Editar
                      </button>
                      <button onClick={() => handleRemoverServico(cat.id, s.id)} style={{
                        padding: '4px 8px', borderRadius: 6, border: '1px solid #EF4444',
                        background: 'transparent', color: '#EF4444', fontSize: 11, cursor: 'pointer',
                      }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {editandoServico && (
              <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              }}>
                <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Editar Serviço</h3>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nome</label>
                  <input value={editandoServico.servico.nome}
                    onChange={e => setEditandoServico({ ...editandoServico, servico: { ...editandoServico.servico, nome: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 12, fontFamily: 'inherit' }} />
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Duração (minutos)</label>
                  <input type="number" value={editandoServico.servico.duracaoMin}
                    onChange={e => setEditandoServico({ ...editandoServico, servico: { ...editandoServico.servico, duracaoMin: parseInt(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 12, fontFamily: 'inherit' }} />
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Valor (R$)</label>
                  <input type="number" step="0.01" value={editandoServico.servico.valor}
                    onChange={e => setEditandoServico({ ...editandoServico, servico: { ...editandoServico.servico, valor: parseFloat(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 20, fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={salvarEdicaoServico} className="btn-primary" style={{ flex: 1 }}>Salvar</button>
                    <button onClick={() => setEditandoServico(null)} style={{
                      padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer',
                    }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {aba === 'perfil' && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Dados da Profissional</h3>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                {foto ? (
                  <img src={foto} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-secondary)' }}>
                    {prof.nome.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <label htmlFor="adminFotoUpload" style={{
                  position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--primary)', border: '2px solid white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', fontSize: 12, color: 'white',
                }}>📷</label>
                <input id="adminFotoUpload" type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: 'none' }} />
              </div>
            </div>

            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nome</label>
            <input value={prof.nome} onChange={e => setProf({ ...prof, nome: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 12, fontFamily: 'inherit' }} />

            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>WhatsApp (com código do país, sem +)</label>
            <input value={prof.whatsapp} onChange={e => setProf({ ...prof, whatsapp: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 12, fontFamily: 'inherit' }} />

            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Instagram (sem @)</label>
            <input value={prof.instagram} onChange={e => setProf({ ...prof, instagram: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 12, fontFamily: 'inherit' }} />

            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Endereço</label>
            <input value={prof.endereco} onChange={e => setProf({ ...prof, endereco: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 20, fontFamily: 'inherit' }} />

            <button className="btn-primary" onClick={salvarPerfil}>
              {salvo ? '✓ Salvo!' : 'Salvar Perfil'}
            </button>
          </>
        )}

        {aba === 'agendamentos' && (
          <>
            {agendamentos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <p>Nenhum agendamento futuro.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agendamentos.map(a => (
                  <div key={a.id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{a.servicos.map(s => s.nome).join(', ')}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {a.horario}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          R$ {a.valorTotal.toFixed(2).replace('.', ',')} • {formatTempo(a.tempoTotal)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>
                          🙋 {a.nomeCliente} • 📱 {a.telefoneCliente}
                        </div>
                      </div>
                      <button onClick={() => handleCancelarAgendamento(a.id)} style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid #EF4444',
                        background: 'transparent', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
