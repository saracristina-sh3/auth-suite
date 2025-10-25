import axios from 'axios'

// Define corretamente a URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  console.log('📤 Enviando requisição:', {
    url: config.url,
    method: config.method,
    data: config.data,
  })

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros (sem importações circulares)
api.interceptors.response.use(
  (response) => {
    console.log('📥 Resposta recebida:', {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    })

    const requestUrl = error.config?.url || ''
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/login') &&
      !requestUrl.includes('/register')
    ) {
      // Limpa tokens de autenticação
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('support_context')
      localStorage.removeItem('original_user_data')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
