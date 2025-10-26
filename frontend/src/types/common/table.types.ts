// Tipos compartilhados para configuração de tabelas e formulários genéricos

/**
 * Interface básica para opções de select simples
 */
export interface SelectOption<T = string | number> {
  label: string
  value: T
}

/**
 * Tipo para opções de select que podem ser objetos complexos ou valores primitivos
 * Usa unknown[] para máxima flexibilidade com objetos tipados
 */
export type SelectOptionValue = SelectOption | string | number | { [key: string]: unknown }

export interface ColumnConfig {
  field: string
  header: string
  sortable?: boolean
  style?: string
  type?: 'text' | 'boolean' | 'date' | 'cpf'
}

export interface ActionConfig {
  name: string
  icon: string
  event: string
  tooltip?: string
  class?: string
}

/**
 * Tipo genérico para configuração de campos de formulários dinâmicos.
 *
 * @template T - Tipo das opções de select (padrão: unknown para máxima flexibilidade)
 */
export interface FieldConfig<T = unknown> {
  name: string
  label: string

  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  rows?: number

  // Select / opções - aceita qualquer tipo de objeto
  options?: T[]
  optionLabel?: keyof T | string
  optionValue?: keyof T | string
  multiple?: boolean
  searchable?: boolean

  // Valores padrão e máscaras
  defaultValue?: string | number | boolean | null
  mask?: string

  // Validação e formatação
  validate?: (value: string) => true | string
  format?: (value: string) => string
}
