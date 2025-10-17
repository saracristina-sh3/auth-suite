// src/composables/useUserTableConfig.ts
import { computed, type Ref } from 'vue'
import type { Role } from '@/services/role.service'
import type { Autarquia } from '@/types/auth'
import type { ColumnConfig, ActionConfig, FieldConfig } from '@/types/table'

export function useUserTableConfig(roles: Ref<Role[]>, autarquias: Ref<Autarquia[]>) {
  const columns: ColumnConfig[] = [
    { field: 'id', header: 'ID', style: 'width: 80px' },
    { field: 'name', header: 'Nome' },
    { field: 'email', header: 'E-mail' },
    { field: 'cpf', header: 'CPF' },
    { field: 'role', header: 'Função' },
    { field: 'autarquia', header: 'Autarquia' },
    { field: 'is_active', header: 'Status', type: 'boolean' }
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
      name: 'delete',
      icon: 'pi pi-trash',
      event: 'delete',
      tooltip: 'Excluir',
      class: 'p-button-danger'
    }
  ]

  const fields = computed((): FieldConfig[] => [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      autofocus: true,
      placeholder: 'Digite o nome completo'
    },
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      required: true,
      placeholder: 'Digite o e-mail'
    },
    {
      name: 'cpf',
      label: 'CPF',
      type: 'text',
      required: true,
      placeholder: '000.000.000-00'
    },
    {
      name: 'password',
      label: 'Senha',
      type: 'password',
      required: false,
      placeholder: 'Digite a senha'
    },
    {
      name: 'role',
      label: 'Função',
      type: 'select',
      required: true,
      options: roles.value,
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      name: 'autarquia_ativa_id',
      label: 'Autarquia',
      type: 'select',
      required: true,
      options: autarquias.value,
      optionLabel: 'nome',
      optionValue: 'id'
    },
    {
      name: 'is_active',
      label: 'Usuário ativo',
      type: 'checkbox',
      defaultValue: true
    }
  ])

  return {
    columns,
    actions,
    fields
  }
}
