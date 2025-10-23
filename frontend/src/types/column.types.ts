export interface ColumnConfig {
  field: string
  header: string
  sortable?: boolean
  style?: string
  type?: 'text' | 'boolean' | 'date' | 'cpf'
}