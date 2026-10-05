// Auto-generated from your database schema — do not edit by hand.
// Regenerates automatically whenever a table is created or altered.

export type AppConfigRow = {
  appName: string | null
  createdAt: string | null
  id: string
  superAdminEmails: string | null
  systemSettings: string | null
  updatedAt: string | null
}

export type ClienteRow = {
  createdAt: string | null
  email: string | null
  empresaId: string
  id: string
  nome: string
  observacoes: string | null
  status: string | null
  tags: string | null
  telefone: string | null
  updatedAt: string | null
}

export type EmpresaRow = {
  anosMercado: number | string | null
  ciclo: string | null
  cnpj: string | null
  corPrimaria: string | null
  corSecundaria: string | null
  createdAt: string | null
  dataInicio: string | null
  email: string | null
  endereco: string | null
  id: string
  logoUrl: string | null
  nome: string
  onboardingConcluido: boolean | null
  ownerEmail: string | null
  ownerNome: string | null
  plano: string | null
  proximoVencimento: string | null
  slogan: string | null
  slug: string | null
  sobre: string | null
  status: string | null
  statusCobranca: string | null
  telefone: string | null
  trialAte: string | null
  ultimoAcessoOwner: string | null
  updatedAt: string | null
  valor: number | string | null
  vitrineAtiva: boolean | null
  whatsapp: string | null
}

export type EmpresaUserRow = {
  ativo: boolean | null
  authUserId: string | null
  createdAt: string | null
  email: string
  empresaId: string | null
  id: string
  nome: string | null
  role: string | null
  ultimoLogin: string | null
  updatedAt: string | null
}

export type HorarioFuncionamentoRow = {
  abre: string | null
  createdAt: string | null
  diaSemana: number | string
  empresaId: string
  fecha: string | null
  fechado: boolean | null
  id: string
}

export type LancamentoRow = {
  categoria: string | null
  clienteId: string | null
  createdAt: string | null
  data: string | null
  descricao: string
  empresaId: string
  forma: string | null
  id: string
  orcamentoId: string | null
  osId: string | null
  status: string | null
  tipo: string | null
  updatedAt: string | null
  valor: number | string
}

export type OrcamentoRow = {
  clienteId: string
  clienteNome: string | null
  convertidoEmOs: boolean | null
  createdAt: string | null
  data: string | null
  empresaId: string
  id: string
  itens: string | null
  numero: string | null
  observacoes: string | null
  status: string | null
  total: number | string | null
  updatedAt: string | null
  validade: string | null
  veiculoDesc: string | null
  veiculoId: string
}

export type OrdemServicoRow = {
  clienteId: string
  clienteNome: string | null
  createdAt: string | null
  dataAbertura: string | null
  dataConclusao: string | null
  dataPrevista: string | null
  empresaId: string
  id: string
  itens: string | null
  numero: string | null
  orcamentoId: string | null
  pagamentoStatus: string | null
  prioridade: string | null
  status: string | null
  tecnico: string | null
  tecnicoId: string | null
  total: number | string | null
  updatedAt: string | null
  veiculoDesc: string | null
  veiculoId: string
}

export type ProfilesRow = {
  userId: string
  email: string | null
}

export type ServicoReferenciaRow = {
  ativo: boolean | null
  categoria: string | null
  createdAt: string | null
  descricao: string | null
  duracaoMin: number | string | null
  empresaId: string
  icone: string | null
  id: string
  nome: string
  ordem: number | string | null
  updatedAt: string | null
  valorReferencia: number | string | null
}

export type SolicitacaoRow = {
  clienteEmail: string | null
  clienteNome: string
  clienteTelefone: string
  createdAt: string | null
  dataAgendada: string | null
  descricao: string | null
  empresaId: string
  horaAgendada: string | null
  id: string
  protocolo: string | null
  servicos: string | null
  status: string | null
  tipo: string | null
  veiculoAno: number | string | null
  veiculoKm: number | string | null
  veiculoMarca: string | null
  veiculoModelo: string | null
  veiculoPlaca: string | null
}

export type TemplateOwnerRow = {
  id: string
  userId: string
}

export type UserRolesRow = {
  createdAt: string | null
  empresaId: string | null
  id: string
  role: string
  userId: string
}

export type VeiculoRow = {
  ano: number | string | null
  clienteId: string
  clienteNome: string | null
  cor: string | null
  createdAt: string | null
  empresaId: string
  id: string
  marca: string
  modelo: string
  placa: string
  proximaRevisao: string | null
  quilometragem: number | string | null
  ultimaRevisao: string | null
  updatedAt: string | null
}
