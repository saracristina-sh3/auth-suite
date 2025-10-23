// src/types/table.ts
// Tipos compartilhados para configuração de tabelas genéricas

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

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  rows?: number
  options?: any[]
  optionLabel?: string
  optionValue?: string
  defaultValue?: any
  multiple?: boolean      // Habilita multi-seleção em campos select
  searchable?: boolean    // Habilita busca em campos select com multi-seleção
}
