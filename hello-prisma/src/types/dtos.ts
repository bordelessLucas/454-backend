export interface LoginDTO {
  username: string;
  password: string;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  nome: string;
  email: string;
  role: "ADMIN" | "TECNICO";
}

export interface UpdateUserDTO {
  nome?: string;
  email?: string;
  role?: "ADMIN" | "TECNICO";
  ativo?: boolean;
}

export interface CreateClienteDTO {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string;
  email?: string;
  ramoAtividadeId: number;
}

export interface UpdateClienteDTO {
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ramoAtividadeId?: number;
  ativo?: boolean;
}

export interface CreateChecklistDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateChecklistDTO {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CreateRelatorioDTO {
  clienteId: number;
  contatoId?: number;
  dataVisita: string;
  observacoes?: string;
  tecnicos: string[];
  setores: Array<{ setorId: number; observacao?: string }>;
  horarios: { horaChegada: string; horaSaida: string };
  checklists: Array<{ checklistId: number }>;
}

export interface UpdateRelatorioDTO {
  clienteId?: number;
  contatoId?: number;
  dataVisita?: string;
  observacoes?: string;
  impresso?: boolean;
  tecnicos?: string[];
  setores?: Array<{ setorId: number; observacao?: string }>;
  horarios?: { horaChegada: string; horaSaida: string };
  checklists?: Array<{ checklistId: number }>;
}

export interface RelatorioFilters {
  clienteId?: number;
  dataInicio?: string;
  dataFim?: string;
  criadoPorId?: number;
  impresso?: boolean;
}

export interface ClienteFilters {
  nomeFantasia?: string;
  cnpj?: string;
  ramoAtividadeId?: number;
}
