export type Tela =
  | 'servicos'
  | 'autenticacao'
  | 'calendario'
  | 'confirmacao'
  | 'sucesso'
  | 'meus-agendamentos'

export interface Servico {
  id: string
  nome: string
  duracao: string
  duracaoMin: number
  valor: number
  valorStr: string
}

export interface Categoria {
  id: string
  nome: string
  servicos: Servico[]
}

export interface ResumoAgendamento {
  servicos: Servico[]
  profissional: string
  data: string
  horario: string
  valorTotal: number
  tempoTotal: number
  nomeCliente: string
  telefoneCliente: string
  emailCliente: string
  pinCliente: string
}

export interface ConfiguracaoHorarios {
  diasAtivos: boolean[]
  horaInicio: string
  horaFim: string
  datasBloqueadas: string[]
  intervaloMin: number
}

export interface AgendamentoSalvo extends ResumoAgendamento {
  id: string
  criadoEm: string
}

export interface DadosProfissional {
  nome: string
  foto: string
  whatsapp: string
  instagram: string
  endereco: string
  latitude: number
  longitude: number
}

export interface SessaoCliente {
  email: string
  telefone: string
  nome: string
  logadoEm: string
}
