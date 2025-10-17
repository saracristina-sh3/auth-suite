// src/types/auth.ts
export interface Autarquia {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Modulo {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
  ativo: boolean;
  // Legacy fields for compatibility with existing UI
  key?: string;
  title?: string;
  description?: string;
  icon?: string;
  route?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;
  autarquia_ativa_id: number;
  autarquia?: Autarquia;
  is_active: boolean;
  is_superadmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
