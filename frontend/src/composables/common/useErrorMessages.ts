import { ErrorType, type ProcessedError, type ErrorSeverity } from '@/types/common/error.types'
import {
  ERROR_MESSAGES,
  HTTP_ERROR_MAP,
  BUSINESS_ERROR_MESSAGES,
  VALIDATION_MESSAGES
} from '@/utils/error-messages'

/**
 * Interface para erro da API
 */
interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
      error?: string
      code?: string
      errors?: Record<string, string[]>
    }
  }
  message?: string
  code?: string
}

/**
 * Composable para processar e formatar mensagens de erro
 */
export function useErrorMessages() {
  /**
   * Determina o tipo de erro baseado no código HTTP
   */
  function getErrorTypeFromStatus(status?: number): ErrorType {
    if (!status) return ErrorType.UNKNOWN
    return HTTP_ERROR_MAP[status] || ErrorType.UNKNOWN
  }

  /**
   * Processa um erro e retorna uma mensagem amigável
   */
  function processError(error: unknown): ProcessedError {
    // Erro de rede
    if (!error || (error as ApiError).code === 'ERR_NETWORK') {
      return ERROR_MESSAGES[ErrorType.NETWORK]
    }

    const apiError = error as ApiError

    // Tenta pegar o código de erro de negócio do backend
    const businessCode = apiError.response?.data?.code
    if (businessCode && BUSINESS_ERROR_MESSAGES[businessCode]) {
      return {
        ...BUSINESS_ERROR_MESSAGES[businessCode],
        technicalDetails: apiError.response?.data?.message
      }
    }

    // Determina o tipo de erro pelo status HTTP
    const status = apiError.response?.status
    const errorType = getErrorTypeFromStatus(status)
    const baseError = ERROR_MESSAGES[errorType]

    // Usa mensagem do backend se disponível, senão usa a padrão
    const backendMessage = apiError.response?.data?.message || apiError.response?.data?.error

    return {
      ...baseError,
      message: backendMessage || baseError.message,
      technicalDetails: apiError.message
    }
  }

  /**
   * Processa erros de validação e retorna mensagens formatadas
   */
  function processValidationErrors(errors: Record<string, string[]>): string {
    const messages: string[] = []

    for (const [field, fieldErrors] of Object.entries(errors)) {
      const fieldName = formatFieldName(field)

      fieldErrors.forEach(error => {
        const validationKey = getValidationKey(error)
        const message = VALIDATION_MESSAGES[validationKey] || error
        messages.push(`${fieldName}: ${message}`)
      })
    }

    return messages.join('\n')
  }

  /**
   * Formata o nome do campo para exibição
   */
  function formatFieldName(field: string): string {
    const fieldNames: Record<string, string> = {
      'name': 'Nome',
      'email': 'E-mail',
      'cpf': 'CPF',
      'password': 'Senha',
      'password_confirmation': 'Confirmação de Senha',
      'role': 'Função',
      'autarquia_preferida_id': 'Autarquia Preferida',
      'autarquias': 'Autarquias',
      'nome': 'Nome',
      'descricao': 'Descrição',
      'icone': 'Ícone',
      'ativo': 'Status'
    }

    return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
  }

  /**
   * Extrai a chave de validação da mensagem de erro
   */
  function getValidationKey(error: string): string {
    if (error.includes('required')) return 'required'
    if (error.includes('email')) return 'email'
    if (error.includes('cpf')) return 'cpf'
    if (error.includes('min')) return 'min.length'
    if (error.includes('max')) return 'max.length'
    if (error.includes('confirmed')) return 'password.mismatch'
    return 'invalid.format'
  }

  /**
   * Retorna a classe CSS para a severidade
   */
  function getSeverityClass(severity: ErrorSeverity): string {
    const severityClasses: Record<ErrorSeverity, string> = {
      'error': 'text-destructive bg-destructive/10 border-destructive',
      'warning': 'text-orange-600 bg-orange-50 border-orange-300',
      'validation': 'text-yellow-700 bg-yellow-50 border-yellow-300'
    }
    return severityClasses[severity]
  }

  /**
   * Retorna o ícone para a severidade
   */
  function getSeverityIcon(severity: ErrorSeverity): string {
    const severityIcons: Record<ErrorSeverity, string> = {
      'error': 'pi pi-times-circle',
      'warning': 'pi pi-exclamation-triangle',
      'validation': 'pi pi-info-circle'
    }
    return severityIcons[severity]
  }

  return {
    processError,
    processValidationErrors,
    formatFieldName,
    getSeverityClass,
    getSeverityIcon
  }
}
