import axios from 'axios'
import { tokenService } from './token.service'

// Define corretamente a URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // ✅ Importante: envia cookies em todas as requisições
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  console.log('📤 Enviando requisição:', {
    url: config.url,
    method: config.method,
    data: config.data,
  })

  // ✅ Usar tokenService para obter token
  const token = tokenService.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Flag para evitar loop infinito de refresh
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor para tratar erros e tentar refresh automaticamente
api.interceptors.response.use(
  (response) => {
    console.log('📥 Resposta recebida:', {
      status: response.status,
      data: response.data,
    })
    return response
  },
  async (error) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    })

    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''

    // Se for erro 401 e não for login/register/refresh
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/login') &&
      !requestUrl.includes('/register') &&
      !requestUrl.includes('/refresh') &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Se já está refreshing, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        console.warn('⚠️ Sem refresh token, redirecionando para login')
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Tentar renovar o token
        console.log('🔄 Tentando renovar token...')
        const response = await axios.post(
          `${API_URL}/refresh`,
          null,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        )

        const { token, refresh_token, expires_in } = response.data

        // Atualizar tokens
        localStorage.setItem('auth_token', token)
        localStorage.setItem('refresh_token', refresh_token)

        if (expires_in) {
          const expiresAt = Date.now() + (expires_in * 1000)
          localStorage.setItem('token_expires_at', expiresAt.toString())
        }

        console.log('✅ Token renovado com sucesso')

        // Atualizar header da requisição original
        originalRequest.headers.Authorization = 'Bearer ' + token

        // Processar fila de requisições que estavam esperando
        processQueue(null, token)

        isRefreshing = false

        // Reenviar requisição original com novo token
        return api(originalRequest)

      } catch (refreshError) {
        console.error('❌ Falha ao renovar token:', refreshError)

        // Limpar tokens e redirecionar para login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expires_at')
        localStorage.removeItem('user_data')
        localStorage.removeItem('support_context')
        localStorage.removeItem('original_user_data')

        processQueue(refreshError, null)
        isRefreshing = false

        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
