import type { AxiosError } from 'axios'

/**
 * Estrutura de erro da API
 */
export interface ApiError {
  message?: string
  error?: string
  errors?: Record<string, string[]>
  status?: number
}

/**
 * Estrutura de resposta de erro processado
 */
export interface ProcessedError {
  message: string
  errors?: Record<string, string[]>
  status?: number
  type: 'validation' | 'authentication' | 'authorization' | 'server' | 'network' | 'unknown'
}

/**
 * Extrai mensagens de erro de um objeto AxiosError
 *
 * @param error - Erro do Axios
 * @returns Objeto com mensagem principal e detalhes do erro
 *
 * @example
 * ```typescript
 * try {
 *   await api.post('/users', data)
 * } catch (err) {
 *   const { message, errors, type } = handleApiError(err)
 *   console.log(message) // "Email já está em uso"
 *   console.log(errors) // { email: ["Email já está em uso"] }
 *   console.log(type) // "validation"
 * }
 * ```
 */
export function handleApiError(error: unknown): ProcessedError {
  // Erro não é do Axios - pode ser erro de rede ou outro
  if (!isAxiosError(error)) {
    return handleGenericError(error)
  }

  const axiosError = error as AxiosError<ApiError>
  const status = axiosError.response?.status
  const data = axiosError.response?.data

  // Processar por código de status HTTP
  switch (status) {
    case 422: // Unprocessable Entity - Validação
      return handleValidationError(data)

    case 401: // Unauthorized - Autenticação
      return handleAuthenticationError(data)

    case 403: // Forbidden - Autorização
      return handleAuthorizationError(data)

    case 404: // Not Found
      return handleNotFoundError(data)

    case 500: // Internal Server Error
    case 502: // Bad Gateway
    case 503: // Service Unavailable
      return handleServerError(data, status)

    case 400: // Bad Request
      return handleBadRequestError(data)

    default:
      // Erro de rede ou timeout
      if (!axiosError.response) {
        return handleNetworkError(axiosError)
      }

      // Erro desconhecido com resposta
      return {
        message: data?.message || data?.error || 'Erro inesperado ao processar a requisição.',
        errors: data?.errors,
        status,
        type: 'unknown'
      }
  }
}

/**
 * Processa erros de validação (422)
 * Extrai mensagens de erro de cada campo
 */
function handleValidationError(data?: ApiError): ProcessedError {
  const errors = data?.errors || {}
  const firstError = Object.values(errors)[0]?.[0]

  return {
    message: firstError || data?.message || 'Erro de validação. Verifique os campos e tente novamente.',
    errors,
    status: 422,
    type: 'validation'
  }
}

/**
 * Processa erros de autenticação (401)
 */
function handleAuthenticationError(data?: ApiError): ProcessedError {
  const defaultMessage = 'Sessão expirada. Por favor, faça login novamente.'

  return {
    message: data?.message || data?.error || defaultMessage,
    status: 401,
    type: 'authentication'
  }
}

/**
 * Processa erros de autorização (403)
 */
function handleAuthorizationError(data?: ApiError): ProcessedError {
  const defaultMessage = 'Você não tem permissão para realizar esta ação.'

  return {
    message: data?.message || data?.error || defaultMessage,
    status: 403,
    type: 'authorization'
  }
}

/**
 * Processa erros de recurso não encontrado (404)
 */
function handleNotFoundError(data?: ApiError): ProcessedError {
  const defaultMessage = 'Recurso não encontrado.'

  return {
    message: data?.message || data?.error || defaultMessage,
    status: 404,
    type: 'unknown'
  }
}

/**
 * Processa erros de servidor (500, 502, 503)
 */
function handleServerError(data?: ApiError, status?: number): ProcessedError {
  const defaultMessage = 'Erro no servidor. Tente novamente em alguns instantes.'

  return {
    message: data?.message || data?.error || defaultMessage,
    status,
    type: 'server'
  }
}

/**
 * Processa erros de requisição inválida (400)
 */
function handleBadRequestError(data?: ApiError): ProcessedError {
  const defaultMessage = 'Requisição inválida. Verifique os dados enviados.'

  return {
    message: data?.message || data?.error || defaultMessage,
    errors: data?.errors,
    status: 400,
    type: 'unknown'
  }
}

/**
 * Processa erros de rede (timeout, sem conexão)
 */
function handleNetworkError(error: AxiosError): ProcessedError {
  let message = 'Erro de conexão. Verifique sua internet e tente novamente.'

  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    message = 'Tempo de espera esgotado. Tente novamente.'
  } else if (error.code === 'ERR_NETWORK') {
    message = 'Sem conexão com o servidor. Verifique sua internet.'
  }

  return {
    message,
    type: 'network'
  }
}

/**
 * Processa erros genéricos (não-Axios)
 */
function handleGenericError(error: unknown): ProcessedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'unknown'
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      type: 'unknown'
    }
  }

  return {
    message: 'Erro inesperado.',
    type: 'unknown'
  }
}

/**
 * Type guard para verificar se é um erro do Axios
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

/**
 * Formata erros de validação em uma única string
 * Útil para exibir em toasts/alerts
 *
 * @example
 * ```typescript
 * const errors = { email: ["Email inválido"], cpf: ["CPF inválido"] }
 * formatValidationErrors(errors)
 * // Retorna: "Email inválido\nCPF inválido"
 * ```
 */
export function formatValidationErrors(errors?: Record<string, string[]>): string {
  if (!errors || Object.keys(errors).length === 0) {
    return ''
  }

  return Object.values(errors)
    .flat()
    .join('\n')
}

/**
 * Obtém a primeira mensagem de erro de validação
 *
 * @example
 * ```typescript
 * const errors = { email: ["Email inválido", "Email já existe"], cpf: ["CPF inválido"] }
 * getFirstValidationError(errors)
 * // Retorna: "Email inválido"
 * ```
 */
export function getFirstValidationError(errors?: Record<string, string[]>): string | null {
  if (!errors || Object.keys(errors).length === 0) {
    return null
  }

  const firstField = Object.keys(errors)[0]
  if (!firstField) {
    return null
  }
  return errors[firstField]?.[0] || null
}

/**
 * Obtém mensagens de erro de um campo específico
 *
 * @example
 * ```typescript
 * const errors = { email: ["Email inválido", "Email já existe"] }
 * getFieldErrors(errors, 'email')
 * // Retorna: ["Email inválido", "Email já existe"]
 * ```
 */
export function getFieldErrors(
  errors: Record<string, string[]> | undefined,
  fieldName: string
): string[] {
  return errors?.[fieldName] || []
}

/**
 * Função de conveniência que retorna apenas a mensagem de erro
 * Compatível com a função antiga getErrorMessage
 *
 * @example
 * ```typescript
 * try {
 *   await api.post('/users', data)
 * } catch (err) {
 *   const message = getErrorMessage(err)
 *   console.log(message) // "Email já está em uso"
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  const processed = handleApiError(error)
  return processed.message
}
