
export interface Modulo {
  id: number
  nome: string
  descricao?: string
  icone?: string
  ativo: boolean
  pivot?: {
    ativo: boolean
    created_at: string
    updated_at: string
  }
}

// Interface estendida para módulos com UI
export interface ModuloWithUI extends Modulo {
  icon?: any
  route?: string
  key?: string
  title?: string
  description?: string
}