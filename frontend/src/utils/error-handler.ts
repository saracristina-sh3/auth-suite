import type { AxiosError } from 'axios'
import {
  ErrorType,
  type ProcessedError as FriendlyProcessedError,
  type ErrorSeverity
} from '@/types/common/error.types'
import { ERROR_MESSAGES, HTTP_ERROR_MAP, BUSINESS_ERROR_MESSAGES } from './error-messages'

/**
 * Estrutura de erro da API
 */
export interface ApiError {
  message?: string
  error?: string
  code?: string
  errors?: Record<string, string[]>
  status?: number
}

/**
 * Estrutura de resposta de erro processado (mantida para compatibilidade)
 */
export interface ProcessedError {
  message: string
  errors?: Record<string, string[]>
  status?: number
  type: 'validation' | 'authentication' | 'authorization' | 'server' | 'network' | 'unknown'
  severity?: ErrorSeverity
  title?: string
  instruction?: string
  technicalDetails?: string
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

  // Verificar se há código de erro de negócio do backend
  const businessCode = data?.code
  if (businessCode && BUSINESS_ERROR_MESSAGES[businessCode]) {
    const friendlyError = BUSINESS_ERROR_MESSAGES[businessCode]
    return {
      message: friendlyError.message,
      title: friendlyError.title,
      instruction: friendlyError.instruction,
      severity: friendlyError.severity,
      technicalDetails: data?.message || data?.error,
      errors: data?.errors,
      status,
      type: mapErrorTypeToLegacyType(ErrorType.VALIDATION)
    }
  }

  // Mapear status HTTP para tipo de erro
  const errorType = status ? (HTTP_ERROR_MAP[status] || ErrorType.UNKNOWN) : ErrorType.NETWORK
  const friendlyError = ERROR_MESSAGES[errorType]

  // Processar por código de status HTTP
  switch (status) {
    case 422: // Unprocessable Entity - Validação
      return handleValidationError(data, friendlyError)

    case 401: // Unauthorized - Autenticação
      return handleAuthenticationError(data, friendlyError)

    case 403: // Forbidden - Autorização
      return handleAuthorizationError(data, friendlyError)

    case 404: // Not Found
      return handleNotFoundError(data, friendlyError)

    case 500: // Internal Server Error
    case 502: // Bad Gateway
    case 503: // Service Unavailable
      return handleServerError(data, status, friendlyError)

    case 400: // Bad Request
      return handleBadRequestError(data, friendlyError)

    default:
      // Erro de rede ou timeout
      if (!axiosError.response) {
        return handleNetworkError(axiosError)
      }

      // Erro desconhecido com resposta
      const unknownFriendly = ERROR_MESSAGES[ErrorType.UNKNOWN]
      return {
        message: data?.message || data?.error || unknownFriendly.message,
        title: unknownFriendly.title,
        instruction: unknownFriendly.instruction,
        severity: unknownFriendly.severity,
        errors: data?.errors,
        status,
        type: 'unknown'
      }
  }
}

/**
 * Mapeia ErrorType novo para tipo legado
 */
function mapErrorTypeToLegacyType(errorType: ErrorType): ProcessedError['type'] {
  const mapping: Record<ErrorType, ProcessedError['type']> = {
    [ErrorType.VALIDATION]: 'validation',
    [ErrorType.AUTHENTICATION]: 'authentication',
    [ErrorType.AUTHORIZATION]: 'authorization',
    [ErrorType.SERVER]: 'server',
    [ErrorType.NETWORK]: 'network',
    [ErrorType.NOT_FOUND]: 'unknown',
    [ErrorType.CONFLICT]: 'unknown',
    [ErrorType.TIMEOUT]: 'network',
    [ErrorType.UNKNOWN]: 'unknown'
  }
  return mapping[errorType]
}

/**
 * Processa erros de validação (422)
 * Extrai mensagens de erro de cada campo
 */
function handleValidationError(data?: ApiError, friendlyError?: FriendlyProcessedError): ProcessedError {
  const errors = data?.errors || {}
  const firstError = Object.values(errors)[0]?.[0]

  return {
    message: firstError || data?.message || friendlyError?.message || 'Erro de validação. Verifique os campos e tente novamente.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    errors,
    status: 422,
    type: 'validation'
  }
}

/**
 * Processa erros de autenticação (401)
 */
function handleAuthenticationError(data?: ApiError, friendlyError?: FriendlyProcessedError): ProcessedError {
  return {
    message: data?.message || data?.error || friendlyError?.message || 'Sessão expirada. Por favor, faça login novamente.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    status: 401,
    type: 'authentication'
  }
}

/**
 * Processa erros de autorização (403)
 */
function handleAuthorizationError(data?: ApiError, friendlyError?: FriendlyProcessedError): ProcessedError {
  return {
    message: data?.message || data?.error || friendlyError?.message || 'Você não tem permissão para realizar esta ação.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    status: 403,
    type: 'authorization'
  }
}

/**
 * Processa erros de recurso não encontrado (404)
 */
function handleNotFoundError(data?: ApiError, friendlyError?: FriendlyProcessedError): ProcessedError {
  return {
    message: data?.message || data?.error || friendlyError?.message || 'Recurso não encontrado.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    status: 404,
    type: 'unknown'
  }
}

/**
 * Processa erros de servidor (500, 502, 503)
 */
function handleServerError(data?: ApiError, status?: number, friendlyError?: FriendlyProcessedError): ProcessedError {
  return {
    message: data?.message || data?.error || friendlyError?.message || 'Erro no servidor. Tente novamente em alguns instantes.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    technicalDetails: data?.error || data?.message,
    status,
    type: 'server'
  }
}

/**
 * Processa erros de requisição inválida (400)
 */
function handleBadRequestError(data?: ApiError, friendlyError?: FriendlyProcessedError): ProcessedError {
  return {
    message: data?.message || data?.error || friendlyError?.message || 'Requisição inválida. Verifique os dados enviados.',
    title: friendlyError?.title,
    instruction: friendlyError?.instruction,
    severity: friendlyError?.severity,
    errors: data?.errors,
    status: 400,
    type: 'unknown'
  }
}

/**
 * Processa erros de rede (timeout, sem conexão)
 */
function handleNetworkError(error: AxiosError): ProcessedError {
  let errorType = ErrorType.NETWORK

  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    errorType = ErrorType.TIMEOUT
  }

  const friendlyError = ERROR_MESSAGES[errorType]

  return {
    message: friendlyError.message,
    title: friendlyError.title,
    instruction: friendlyError.instruction,
    severity: friendlyError.severity,
    technicalDetails: error.message,
    type: 'network'
  }
}

/**
 * Processa erros genéricos (não-Axios)
 */
function handleGenericError(error: unknown): ProcessedError {
  const friendlyError = ERROR_MESSAGES[ErrorType.UNKNOWN]

  if (error instanceof Error) {
    return {
      message: error.message || friendlyError.message,
      title: friendlyError.title,
      instruction: friendlyError.instruction,
      severity: friendlyError.severity,
      type: 'unknown'
    }
  }

  if (typeof error === 'string') {
    return {
      message: error || friendlyError.message,
      title: friendlyError.title,
      instruction: friendlyError.instruction,
      severity: friendlyError.severity,
      type: 'unknown'
    }
  }

  return {
    message: friendlyError.message,
    title: friendlyError.title,
    instruction: friendlyError.instruction,
    severity: friendlyError.severity,
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
