/**
 * Utilitários de validação
 */

/**
 * Remove caracteres não numéricos de uma string
 */
export function removeNonDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida um CPF brasileiro
 *
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido, false caso contrário
 *
 * @example
 * ```typescript
 * validateCPF('123.456.789-09') // true ou false
 * validateCPF('12345678909')     // true ou false
 * validateCPF('111.111.111-11')  // false (CPF inválido - todos dígitos iguais)
 * validateCPF('000.000.000-00')  // false (CPF inválido)
 * ```
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false

  // Remove caracteres não numéricos
  const cleanCPF = removeNonDigits(cpf)

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  const digit1 = remainder >= 10 ? 0 : remainder

  if (digit1 !== parseInt(cleanCPF.charAt(9))) return false

  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  const digit2 = remainder >= 10 ? 0 : remainder

  if (digit2 !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Formata um CPF no padrão brasileiro (XXX.XXX.XXX-XX)
 *
 * @param cpf - CPF com ou sem formatação
 * @returns CPF formatado ou string vazia se inválido
 *
 * @example
 * ```typescript
 * formatCPF('12345678909')        // '123.456.789-09'
 * formatCPF('123.456.789-09')     // '123.456.789-09'
 * formatCPF('123')                // '123' (não formata se incompleto)
 * ```
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return ''

  // Remove caracteres não numéricos
  const cleanCPF = removeNonDigits(cpf)

  // Se não tiver 11 dígitos, retorna apenas os números
  if (cleanCPF.length < 11) {
    // Formata parcialmente enquanto digita
    if (cleanCPF.length <= 3) return cleanCPF
    if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`
    if (cleanCPF.length <= 9) {
      return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`
    }
    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9)}`
  }

  // Formata CPF completo: XXX.XXX.XXX-XX
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`
}

/**
 * Valida um email
 *
 * @param email - Email a ser validado
 * @returns true se o email é válido, false caso contrário
 *
 * @example
 * ```typescript
 * validateEmail('user@example.com')     // true
 * validateEmail('user.name@example.com.br')  // true
 * validateEmail('invalid-email')        // false
 * validateEmail('user@')                // false
 * validateEmail('@example.com')         // false
 * validateEmail('user @example.com')    // false (espaços não permitidos)
 * ```
 */
export function validateEmail(email: string): boolean {
  if (!email) return false

  // Trim whitespace
  email = email.trim()

  // Regex robusto para validação de email
  // Aceita: letras, números, pontos, hífens, underscores na parte local
  // Requer: @ no meio
  // Aceita: domínio com pelo menos um ponto e extensão válida
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Validações adicionais
  if (!emailRegex.test(email)) return false

  // Não permitir pontos consecutivos
  if (email.includes('..')) return false

  // Não permitir ponto antes do @
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return false
  if (localPart.endsWith('.')) return false

  // Não permitir ponto no início
  if (email.startsWith('.')) return false

  return true
}

/**
 * Valida se um campo está preenchido (não vazio)
 *
 * @param value - Valor a ser validado
 * @returns true se o campo está preenchido, false caso contrário
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Valida comprimento mínimo de uma string
 *
 * @param value - Valor a ser validado
 * @param minLength - Comprimento mínimo
 * @returns true se atende ao comprimento mínimo, false caso contrário
 */
export function validateMinLength(value: string, minLength: number): boolean {
  if (!value) return false
  return value.length >= minLength
}

/**
 * Valida comprimento máximo de uma string
 *
 * @param value - Valor a ser validado
 * @param maxLength - Comprimento máximo
 * @returns true se atende ao comprimento máximo, false caso contrário
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  if (!value) return true // Vazio é válido para max length
  return value.length <= maxLength
}

/**
 * Mensagens de erro padrão para validações
 */
export const validationMessages = {
  cpf: {
    invalid: 'CPF inválido',
    required: 'CPF é obrigatório',
    format: 'CPF deve ter 11 dígitos'
  },
  email: {
    invalid: 'Email inválido',
    required: 'Email é obrigatório'
  },
  required: 'Campo obrigatório',
  minLength: (min: number) => `Deve ter no mínimo ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
}
