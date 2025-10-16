// src/composables/useAutarquiaTableConfig.ts
import type { ColumnConfig, ActionConfig, FieldConfig } from '@/types/table'

export function useAutarquiaTableConfig() {
  const columns: ColumnConfig[] = [
    { field: 'id', header: 'ID', style: 'width: 80px' },
    { field: 'nome', header: 'Nome' },
    { field: 'ativo', header: 'Ativo', type: 'boolean' },
    { field: 'created_at', header: 'Criado em', type: 'date' }
  ]

  const actions: ActionConfig[] = [
    {
      name: 'edit',
      icon: 'pi pi-pencil',
      event: 'edit',
      tooltip: 'Editar',
      class: 'p-button-primary'
    },
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
    },
    {
      name: 'delete',
      icon: 'pi pi-trash',
      event: 'delete',
      tooltip: 'Excluir',
      class: 'p-button-danger'
    }
  ]

  const fields: FieldConfig[] = [
    {
      name: 'nome',
      label: 'Nome',
      type: 'text',
      required: true,
      autofocus: true,
      placeholder: 'Digite o nome da autarquia'
    },
    {
      name: 'ativo',
      label: 'Autarquia ativa',
      type: 'checkbox',
      defaultValue: true
    }
  ]

  return {
    columns,
    actions,
    fields
  }
}
