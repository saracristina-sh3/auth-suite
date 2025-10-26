// src/composables/useModuloTableConfig.ts
import type { ColumnConfig, ActionConfig, FieldConfig } from '@/types/common/table.types'

export function useModuloTableConfig() {
  const columns: ColumnConfig[] = [
    { field: 'id', header: 'ID', style: 'width: 80px' },
    { field: 'nome', header: 'Nome' },
    { field: 'descricao', header: 'Descrição' },
    { field: 'icone', header: 'Ícone', style: 'width: 100px' },
    { field: 'ativo', header: 'Ativo', type: 'boolean' }
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
      name: 'toggle-status',
      icon: 'pi pi-power-off',
      event: 'toggle-status',
      tooltip: 'Ativar/Inativar',
      class: 'p-button-warning'
    }
  ]

  const fields: FieldConfig[] = [
    {
      name: 'nome',
      label: 'Nome',
      type: 'text',
      required: true,
      autofocus: true,
      placeholder: 'Digite o nome do módulo'
    },
    {
      name: 'descricao',
      label: 'Descrição',
      type: 'textarea',
      required: false,
      placeholder: 'Descreva o módulo',
      rows: 3
    },
    {
      name: 'icone',
      label: 'Ícone',
      type: 'text',
      required: false,
      placeholder: 'pi pi-home'
    },
    {
      name: 'ativo',
      label: 'Módulo ativo',
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
