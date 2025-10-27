import type { ColumnConfig, FieldConfig } from '@/types/common/table.types'
import { useExtendedActions } from '@/composables/common/useTableAction' 

export function useAutarquiaTableConfig() {
  const columns: ColumnConfig[] = [
    { field: 'id', header: 'ID', style: 'width: 80px' },
    { field: 'nome', header: 'Nome' },
    { field: 'ativo', header: 'Ativo', type: 'boolean' },
    { field: 'created_at', header: 'Criado em', type: 'date' }
  ]

  const actions = useExtendedActions()

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
