import { icons } from './icons'
import type { ActionConfig } from '@/types/actionTypes'

/**
 * Ações padrão da tabela de Autarquias
 */
export const autarquiaActions: ActionConfig[] = [
  { name: 'Editar', event: 'edit', icon: icons.edit },
  { name: 'Excluir', event: 'delete', icon: icons.delete, variant: 'danger' },
  { name: 'Usuários', event: 'viewUsers', icon: icons.users },
  { name: 'Módulos', event: 'viewModules', icon: icons.module }
]

/**
 * Ações padrão da tabela de Usuários
 */
export const userActions: ActionConfig[] = [
  { name: 'Editar', event: 'edit', icon: icons.edit },
  { name: 'Excluir', event: 'delete', icon: icons.delete, variant: 'danger' }
]

/**
 * Ações padrão da tabela de Módulos
 */
export const moduloActions: ActionConfig[] = [
  { name: 'Ativar/Desativar', event: 'toggle', icon: icons.active }
]
