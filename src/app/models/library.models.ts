export type UserStatus = 'ATIVO' | 'INATIVO';
export type UserProfile = 'ALUNO' | 'FUNCIONARIO';

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  endereco: string;
  status: UserStatus;
}

export interface Aluno extends Usuario {
  matricula: string;
  curso: string;
  semestre: number;
  observacao?: string;
}

export interface Funcionario extends Usuario {
  cargo: string;
  setor: string;
  salario: number;
}

export interface Unidade {
  id_unidade: number;
  nome: string;
  endereco: string;
  id_funcionario_gerente: number;
}

export interface Categoria {
  id_categoria: number;
  nome: string;
  descricao: string;
  cor: string;
}

export interface Livro {
  id_livro: number;
  titulo: string;
  autor: string;
  editora: string;
  ano_publicacao: number;
  id_categoria: number;
}

export interface Emprestimo {
  id_emprestimo: number;
  data_emprestimo: string;
  data_devolucao: string;
  multa: number;
  observacao?: string;
}

export interface RealizaEmprestimo {
  id_aluno: number;
  id_emprestimo: number;
}

export interface RegistraItem {
  id_funcionario: number;
  id_emprestimo: number;
  id_livro: number;
}

export interface HistoriaEmprestimo {
  id_emprestimo: number;
  aluno: string;
  funcionario: string;
  livro: string;
  data_emprestimo: string;
  data_devolucao: string;
  status: string;
}

export interface AuthSession {
  name: string;
  roleLabel: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}
