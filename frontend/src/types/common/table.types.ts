// Tipos compartilhados para configuração de tabelas e formulários genéricos

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
 */
export interface FieldConfig<T = unknown> {
  name: string
  label: string

  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  rows?: number

  // Select / opções
  options?: T[]                // ✅ genérico — substitui any[]
  optionLabel?: keyof T | string
  optionValue?: keyof T | string
  multiple?: boolean
  searchable?: boolean

  // Valores padrão e máscaras
  defaultValue?: string | number | boolean | null
  mask?: string                 // ✅ adicionado — ex: "000.000.000-00"

  // Validação e formatação
  validate?: (value: string) => true | string  // ✅ adicionado
  format?: (value: string) => string           // ✅ adicionado
}
