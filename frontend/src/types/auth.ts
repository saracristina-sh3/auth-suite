// src/types/auth.ts
export interface Autarquia {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Modulo {
  id: number
  nome: string
  descricao?: string
  icone?: string
  ativo: boolean
  pivot?: {
    ativo: boolean
    created_at: string
    updated_at: string
  }
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
  // Propriedades adicionadas quando em modo suporte
  _support_mode?: boolean;
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

// Tipo específico para usuário em modo suporte
// Extende User com as modificações feitas pelo supportService
export interface SupportModeUser extends User {
  _support_mode: true;
  role: 'admin';
  is_superadmin: false;
  autarquia: Autarquia; // Sempre presente em modo suporte
  autarquia_ativa_id: number;
}
