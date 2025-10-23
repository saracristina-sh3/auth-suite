// src/types/auth.ts
import type { Autarquia } from "@/types/autarquia.types";

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;
  autarquia_ativa_id?: number | null;
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
  autarquia: Autarquia; 
  autarquia_ativa_id: number;
}
