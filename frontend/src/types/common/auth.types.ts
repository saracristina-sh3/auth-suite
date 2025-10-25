// src/types/auth.ts
import type { Autarquia } from "@/types/support/autarquia.types";
import type { User } from "@/types/common/user.types";


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
