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

  // ✅ NÃO adicionar token em rotas públicas
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route))

  if (!isPublicRoute) {
    const token = tokenService.getAccessToken()
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`
    }
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

      // ✅ Usar tokenService para obter refresh token
      const refreshToken = tokenService.getRefreshToken()

      if (!refreshToken) {
        console.warn('⚠️ Sem refresh token, redirecionando para login')
        isRefreshing = false
        tokenService.clearTokens()

        // Evitar loop: só redirecionar se não estiver já no login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true'
        }
        return Promise.reject(error)
      }

      try {
        // Tentar renovar o token
        console.log('🔄 [Interceptor] Tentando renovar token automaticamente...')
        const response = await axios.post(
          `${API_URL}/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${tokenService.getAccessToken()}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const { token, refresh_token, expires_in } = response.data

        // ✅ Usar tokenService para salvar novos tokens
        tokenService.saveTokens(token, refresh_token, expires_in)

        console.log('✅ [Interceptor] Token renovado automaticamente com sucesso')

        // Atualizar header da requisição original
        originalRequest.headers.Authorization = 'Bearer ' + token

        // Processar fila de requisições que estavam esperando
        processQueue(null, token)

        isRefreshing = false

        // Reenviar requisição original com novo token
        return api(originalRequest)

      } catch (refreshError) {
        console.error('❌ [Interceptor] Falha ao renovar token:', refreshError)

        // ✅ Usar tokenService para limpar tokens
        tokenService.clearTokens()

        processQueue(refreshError, null)
        isRefreshing = false

        // Evitar loop: só redirecionar se não estiver já no login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
