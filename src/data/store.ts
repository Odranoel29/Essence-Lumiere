import type { Categoria, Servico, ResumoAgendamento, ConfiguracaoHorarios, AgendamentoSalvo, DadosProfissional, SessaoCliente } from '../types'
import { supabase } from '../lib/supabase'

const PROF_KEY = 'essence_profissional'
const CAT_KEY = 'essence_categorias'
const FOTO_KEY = 'essence_foto_perfil'
const CONFIG_KEY = 'essence_config_horarios'
const SESSION_KEY = 'essence_sessao'

// ─── Helpers ───

function gerarUUID() {
  return crypto.randomUUID()
}

function formatarValor(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

function servicoParaDB(s: Servico, catId: string) {
  return { categoria_id: catId, nome: s.nome, duracao_min: s.duracaoMin, valor: s.valor }
}

function servicoDoDB(s: any): Servico {
  return {
    id: s.id,
    nome: s.nome,
    duracao: formatarDuracao(s.duracao_min),
    duracaoMin: s.duracao_min,
    valor: s.valor,
    valorStr: formatarValor(s.valor),
  }
}

function formatarDuracao(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

// ─── Dados da Profissional ───

function profissionalPadrao(): DadosProfissional {
  return {
    nome: 'Daiane Batista',
    foto: '',
    whatsapp: '5519993626271',
    instagram: 'daianebatista10',
    endereco: 'Rua Rui Barbosa, 1521, sala 8',
    latitude: -22.9068,
    longitude: -47.0611,
  }
}

export function getProfissional(): DadosProfissional {
  const cached = localStorage.getItem(PROF_KEY)
  if (cached) { try { return JSON.parse(cached) } catch {} }
  return profissionalPadrao()
}

export async function salvarProfissional(dados: DadosProfissional) {
  localStorage.setItem(PROF_KEY, JSON.stringify(dados))
  const { data: profs } = await supabase.from('profissionais').select('id').limit(1)
  if (profs && profs.length > 0) {
    await supabase.from('profissionais').update(dados).eq('id', profs[0].id)
  } else {
    await supabase.from('profissionais').insert(dados)
  }
}

// ─── Foto de perfil ───

export function getFotoPerfil(): string {
  return localStorage.getItem(FOTO_KEY) || ''
}

export async function salvarFotoPerfil(dataUrl: string) {
  localStorage.setItem(FOTO_KEY, dataUrl)
  const { data: profs } = await supabase.from('profissionais').select('id').limit(1)
  if (profs && profs.length > 0) {
    await supabase.from('profissionais').update({ foto: dataUrl }).eq('id', profs[0].id)
  }
}

// ─── Serviços / Categorias ───

function categoriasPadrao(): Categoria[] {
  return [
    {
      id: 'facial', nome: 'Estética Facial',
      servicos: [
        { id: gerarUUID(), nome: 'Design de sobrancelha', duracao: '50 min', duracaoMin: 50, valor: 35, valorStr: 'R$ 35,00' },
        { id: gerarUUID(), nome: 'Design de sobrancelha com Henna', duracao: '1h 10min', duracaoMin: 70, valor: 45, valorStr: 'R$ 45,00' },
        { id: gerarUUID(), nome: 'Limpeza de Pele', duracao: '1h 50min', duracaoMin: 110, valor: 100, valorStr: 'R$ 100,00' },
        { id: gerarUUID(), nome: 'Microagulhamento Facial', duracao: '1h', duracaoMin: 60, valor: 135, valorStr: 'R$ 135,00' },
        { id: gerarUUID(), nome: 'Spa Labial', duracao: '30 min', duracaoMin: 30, valor: 35, valorStr: 'R$ 35,00' },
      ],
    },
    {
      id: 'corporal', nome: 'Estética Corporal',
      servicos: [
        { id: gerarUUID(), nome: 'Massagem Modeladora', duracao: '1h', duracaoMin: 60, valor: 90, valorStr: 'R$ 90,00' },
        { id: gerarUUID(), nome: 'Drenagem Linfática', duracao: '1h', duracaoMin: 60, valor: 85, valorStr: 'R$ 85,00' },
      ],
    },
  ]
}

export function getCategorias(): Categoria[] {
  const cached = localStorage.getItem(CAT_KEY)
  if (cached) { try { return JSON.parse(cached) } catch {} }
  const padrao = categoriasPadrao()
  localStorage.setItem(CAT_KEY, JSON.stringify(padrao))
  return padrao
}

export async function salvarCategorias(categorias: Categoria[]) {
  localStorage.setItem(CAT_KEY, JSON.stringify(categorias))

  const { data: catsDB } = await supabase.from('categorias').select('id, nome')
  const catMap = new Map(catsDB?.map(c => [c.nome, c.id]) || [])

  for (const cat of categorias) {
    let catId = catMap.get(cat.nome)
    if (!catId) {
      const { data } = await supabase.from('categorias').insert({ nome: cat.nome, ordem: 0 }).select('id').single()
      catId = data?.id
      if (catId) catMap.set(cat.nome, catId)
    }
    if (catId) {
      const { data: existing } = await supabase.from('servicos').select('id, nome').eq('categoria_id', catId)
      const existingNames = new Set(existing?.map(s => s.nome) || [])
      for (const sv of cat.servicos) {
        if (!existingNames.has(sv.nome)) {
          await supabase.from('servicos').insert({ ...servicoParaDB(sv, catId) })
        }
      }
    }
  }
}

export async function adicionarServico(categoriaId: string, servico: Servico) {
  const cats = getCategorias()
  const cat = cats.find(c => c.id === categoriaId)
  if (cat) {
    cat.servicos.push(servico)
    await salvarCategorias(cats)
  }
  return getCategorias()
}

export async function editarServico(categoriaId: string, servicoId: string, dados: Partial<Servico>) {
  const cats = getCategorias()
  const cat = cats.find(c => c.id === categoriaId)
  if (cat) {
    const srv = cat.servicos.find(s => s.id === servicoId)
    if (srv) {
      Object.assign(srv, dados)
      srv.valorStr = formatarValor(srv.valor)
      srv.duracao = formatarDuracao(srv.duracaoMin)
      await salvarCategorias(cats)
    }
  }
  return getCategorias()
}

export async function removerServico(categoriaId: string, servicoId: string) {
  const cats = getCategorias()
  const cat = cats.find(c => c.id === categoriaId)
  if (cat) {
    const srv = cat.servicos.find(s => s.id === servicoId)
    cat.servicos = cat.servicos.filter(s => s.id !== servicoId)
    if (srv) {
      const { data: catDB } = await supabase.from('categorias').select('id').eq('nome', cat.nome).single()
      if (catDB) {
        await supabase.from('servicos').delete().eq('categoria_id', catDB.id).eq('nome', srv.nome)
      }
    }
    await salvarCategorias(cats)
  }
  return getCategorias()
}

export async function adicionarCategoria(nome: string) {
  const cats = getCategorias()
  cats.push({ id: gerarUUID(), nome, servicos: [] })
  await salvarCategorias(cats)
  return getCategorias()
}

export async function removerCategoria(id: string) {
  const cats = getCategorias().filter(c => c.id !== id)
  await salvarCategorias(cats)
  return getCategorias()
}

// ─── Configuração de horários ───

function configPadrao(): ConfiguracaoHorarios {
  return {
    diasAtivos: [false, true, true, true, true, true, true],
    horaInicio: '08:00',
    horaFim: '18:00',
    datasBloqueadas: [],
    intervaloMin: 60,
  }
}

export function getConfigHorarios(): ConfiguracaoHorarios {
  const cached = localStorage.getItem(CONFIG_KEY)
  if (cached) { try { return { ...configPadrao(), ...JSON.parse(cached) } } catch {} }
  return configPadrao()
}

export async function salvarConfigHorarios(config: ConfiguracaoHorarios) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  await supabase.from('config_horarios').upsert({
    dias_ativos: config.diasAtivos,
    hora_inicio: config.horaInicio,
    hora_fim: config.horaFim,
    intervalo_min: config.intervaloMin,
    datas_bloqueadas: config.datasBloqueadas,
  })
}

export function getHorariosDisponiveis(): string[] {
  const config = getConfigHorarios()
  const [hInicio, mInicio] = config.horaInicio.split(':').map(Number)
  const [hFim, mFim] = config.horaFim.split(':').map(Number)
  const inicioMin = hInicio * 60 + mInicio
  const fimMin = hFim * 60 + mFim
  const interval = config.intervaloMin

  const horarios: string[] = []
  for (let m = inicioMin; m < fimMin; m += interval) {
    const h = Math.floor(m / 60)
    const min = m % 60
    horarios.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return horarios
}

// ─── Datas ───

export function isDataNoPassado(dia: number, mes: number, ano: number): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(ano, mes, dia)
  return data < hoje
}

export function isDiaAtivo(dia: number, mes: number, ano: number): boolean {
  const config = getConfigHorarios()
  const data = new Date(ano, mes, dia)
  const diaSemana = data.getDay()
  if (!config.diasAtivos[diaSemana]) return false
  const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  if (config.datasBloqueadas.includes(dataStr)) return false
  return true
}

export function isDiaDisponivel(dia: number, mes: number, ano: number): boolean {
  if (isDataNoPassado(dia, mes, ano)) return false
  return isDiaAtivo(dia, mes, ano)
}

// ─── Agendamentos ───

export function formatarTempoTotal(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

export function gerarPin(): string {
  return String(1000 + Math.floor(Math.random() * 9000))
}

export async function salvarAgendamento(resumo: ResumoAgendamento) {
  const novo: AgendamentoSalvo = {
    ...resumo,
    id: gerarUUID(),
    criadoEm: new Date().toISOString(),
  }

  const historico = getAgendamentosLocal()
  historico.push(novo)
  localStorage.setItem('essence_agendamentos', JSON.stringify(historico))

  const { data: cliente } = await supabase
    .from('clientes')
    .upsert({ nome: resumo.nomeCliente, email: resumo.emailCliente, telefone: resumo.telefoneCliente })
    .select('id')
    .single()

  if (cliente) {
    await supabase.from('agendamentos').insert({
      cliente_id: cliente.id,
      servico_ids: resumo.servicos.map(s => s.id),
      data: resumo.data,
      horario: resumo.horario,
      valor_total: resumo.valorTotal,
      tempo_total: resumo.tempoTotal,
      pin: resumo.pinCliente,
      status: 'confirmado',
    })
  }

  return novo
}

function getAgendamentosLocal(): AgendamentoSalvo[] {
  return JSON.parse(localStorage.getItem('essence_agendamentos') || '[]')
}

export function getAgendamentos(): AgendamentoSalvo[] {
  return getAgendamentosLocal()
}

export async function getAgendamentosDoCliente(email: string): Promise<AgendamentoSalvo[]> {
  const local = getAgendamentosLocal().filter(a => a.emailCliente === email)
  return local
}

export function getHorariosOcupados(data: string): string[] {
  return getAgendamentosLocal()
    .filter(a => a.data === data)
    .flatMap(a => {
      const h = parseInt(a.horario.split(':')[0])
      const duracaoHoras = Math.ceil(a.tempoTotal / 60)
      return Array.from({ length: duracaoHoras }, (_, i) =>
        `${String(h + i).padStart(2, '0')}:00`
      )
    })
}

export async function cancelarAgendamento(id: string) {
  const atualizado = getAgendamentosLocal().filter(a => a.id !== id)
  localStorage.setItem('essence_agendamentos', JSON.stringify(atualizado))
  await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id)
  return atualizado
}

// ─── Sessão do Cliente ───

export function loginCliente(email: string, telefone: string, nome: string) {
  const sessao: SessaoCliente = {
    email,
    telefone,
    nome,
    logadoEm: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
  return sessao
}

export function getSessao(): SessaoCliente | null {
  const cached = localStorage.getItem(SESSION_KEY)
  if (!cached) return null
  try { return JSON.parse(cached) } catch { return null }
}

export function logoutCliente() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Admin Auth ───

let adminAutenticado = false

export function isAdminAutenticado(): boolean {
  return adminAutenticado
}

export function setAdminAutenticado(valor: boolean) {
  adminAutenticado = valor
}
