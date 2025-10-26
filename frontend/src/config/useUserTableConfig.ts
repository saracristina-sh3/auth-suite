// src/composables/useUserTableConfig.ts
import { computed, type Ref } from 'vue'
import type { Role } from '@/services/role.service'
import type { Autarquia } from '@/types/support/autarquia.types'
import type { ColumnConfig, ActionConfig, FieldConfig } from '@/types/common/table.types'
import { validateCPF, formatCPF, validateEmail, validationMessages } from '@/utils/validators'

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
      placeholder: 'exemplo@email.com',
      validate: (value: string) => {
        if (!value) return validationMessages.email.required
        if (!validateEmail(value)) return validationMessages.email.invalid
        return true
      }
    },
    {
      name: 'cpf',
      label: 'CPF',
      type: 'text',
      required: true,
      placeholder: '000.000.000-00',
      mask: '000.000.000-00',
      validate: (value: string) => {
        if (!value) return validationMessages.cpf.required
        if (!validateCPF(value)) return validationMessages.cpf.invalid
        return true
      },
      format: (value: string) => formatCPF(value)
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
      name: 'autarquia_preferida_id',
      label: 'Autarquia Preferida',
      type: 'select',
      required: true,
      searchable: true,
      placeholder: 'Selecione a autarquia',
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
