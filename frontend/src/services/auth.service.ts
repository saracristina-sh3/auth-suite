import axios, { type AxiosError } from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiError {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
  };
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log('📤 Enviando requisição:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers
  });

  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('📥 Resposta recebida:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Tentando login com:', { email: credentials.email });
      console.log('📡 API URL:', API_URL);

      const { data } = await api.post<AuthResponse>('/login', credentials);

      console.log('✅ Resposta do login:', data);

      // ✅ CORREÇÃO: Verifica se os dados são válidos antes de salvar
      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      } else {
        throw new Error('Resposta de login inválida');
      }

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message ||
                     axiosError.response?.data?.errors?.email?.[0] ||
                     'Erro ao fazer login. Tente novamente.';
      throw new Error(message);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/register', credentials);

      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      } else {
        throw new Error('Resposta de registro inválida');
      }

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message ||
                     'Erro ao criar conta. Tente novamente.';
      throw new Error(message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const { data } = await api.get<{ user: User }>('/user');

      // ✅ CORREÇÃO: Verifica se os dados são válidos antes de salvar
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
      } else {
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await api.post('/logout');
      } catch {
        // Ignora erros de logout
      }
    }

    // ✅ CORREÇÃO: Limpa todos os dados de autenticação
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common.Authorization;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token && token !== 'undefined' && token !== 'null';
  }

  getUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('user_data');

      // ✅ CORREÇÃO: Verificações mais rigorosas
      if (!userData ||
          userData === 'undefined' ||
          userData === 'null' ||
          userData === '""' ||
          userData.trim() === '') {
        return null;
      }

      const parsed = JSON.parse(userData);

      // ✅ Verifica se o objeto parseado tem a estrutura esperada
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.email) {
        return parsed as User;
      } else {
        // Dados corrompidos - limpa
        localStorage.removeItem('user_data');
        return null;
      }
    } catch (error) {
      console.error('Erro ao fazer parse do user_data:', error);
      // Limpa dados corrompidos
      localStorage.removeItem('user_data');
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getUserFromStorage();
    return user ? user.role === role || user.is_superadmin : false;
  }

  canAccess(permission: string): boolean {
    const user = this.getUserFromStorage();
    if (!user) return false;

    if (user.is_superadmin) return true;

    const rolePermissions: { [key: string]: string[] } = {
      user: ['view_dashboard'],
      manager: ['view_dashboard', 'manage_users', 'view_reports'],
      admin: ['view_dashboard', 'manage_users', 'manage_system', 'view_reports']
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  }
}

export const authService = new AuthService();

// Exportações para compatibilidade
export const getUser = () => authService.getCurrentUser();
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const isAuthenticated = () => authService.isAuthenticated();

export default api;
