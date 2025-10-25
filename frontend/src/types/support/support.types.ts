import type { Autarquia } from '@/types/autarquia.types'
import type { Modulo } from '@/types/modulos.types'
import type { User } from '@/types/auth.types'

export interface SupportContext {
  autarquia: Autarquia
  support_mode: boolean
  is_admin: boolean
  modulos: Modulo[]
  permissions: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    manage_users: boolean
    manage_modules: boolean
  }
}

export interface AssumeContextResponse {
  success: boolean
  message: string
  token: string
  context: SupportContext
}

export interface ExitContextResponse {
  success: boolean
  message: string
  token: string
  user: User
}