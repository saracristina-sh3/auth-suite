// src/composables/useTableActions.ts
import type { ActionConfig } from '@/types/common/table.types'

/**
 * Retorna ações básicas comuns a várias tabelas
 * (Editar / Ativar-Inativar)
 */
export function useBaseActions(): ActionConfig[] {
  return [
    {
      name: 'edit',
      icon: 'pi pi-pencil',
      event: 'edit',
      tooltip: 'Editar',
      class: 'p-button-primary'
    },
    {
      name: 'toggle-status',
      icon: 'pi pi-power-off',
      event: 'toggle-status',
      tooltip: 'Ativar/Inativar',
      class: 'p-button-warning'
    }
  ]
}

/**
 * Retorna ações completas usadas em tabelas como Autarquia
 * (Editar / Ativar-Inativar / Ver Usuários / Ver Módulos)
 */
export function useExtendedActions(): ActionConfig[] {
  return [
    ...useBaseActions(),
    {
      name: 'users',
      icon: 'pi pi-users',
      event: 'viewUsers',
      tooltip: 'Ver Usuários',
      class: 'p-button-info'
    },
    {
      name: 'modules',
      icon: 'pi pi-box',
      event: 'viewModules',
      tooltip: 'Ver Módulos',
      class: 'p-button-secondary'
    }
  ]
}
