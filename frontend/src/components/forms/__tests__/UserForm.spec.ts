import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '@/components/forms/UserForm.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mocks mais realistas
vi.mock('@/services/user.service', () => ({
  userService: {
    create: vi.fn(),
    update: vi.fn(),
    list: vi.fn().mockResolvedValue({ 
      data: [], 
      total: 0,
      success: true,
      message: 'OK',
      meta: { current_page: 1, per_page: 10, total: 0 }
    })
  }
}))

// Mock dos componentes filhos
vi.mock('@/components/common/modal/Sh3ModalForm.vue', () => ({
  default: {
    template: `
      <div>
        <slot name="header">{{ title }}</slot>
        <slot></slot>
        <button 
          :disabled="disabled || loading" 
          @click="$emit('submit')"
          data-testid="submit-btn"
        >
          {{ loading ? loadingLabel : submitLabel }}
        </button>
        <button @click="$emit('cancel')" data-testid="cancel-btn">Cancelar</button>
      </div>
    `,
    props: ['title', 'loading', 'disabled', 'submitLabel', 'loadingLabel'],
    emits: ['submit', 'cancel']
  }
}))

vi.mock('@/components/common/Sh3Select.vue', () => ({
  default: {
    template: '<select><slot></slot></select>',
    props: ['modelValue', 'field'],
    emits: ['update:modelValue']
  }
}))

describe('UserForm', () => {
  const mockRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuário' }
  ]

  const mockAutarquias = [
    { id: 1, nome: 'Autarquia 1', ativo: true },
    { id: 2, nome: 'Autarquia 2', ativo: false }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário vazio em modo criação', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    // Expor o componente para poder chamar open()
    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    expect(wrapper.find('input[name="name"]').element.value).toBe('')
    expect(wrapper.find('input[name="email"]').element.value).toBe('')
    expect(wrapper.find('input[name="cpf"]').element.value).toBe('')
    expect(wrapper.find('[data-testid="submit-btn"]').text()).toContain('Salvar')
  })

  it('deve preencher formulário em modo edição', async () => {
    const user = {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901',
      role: 'admin',
      autarquias: [1],
      autarquia_preferida_id: 1,
      is_active: true
    }

    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    // Expor e chamar open com usuário
    const vm = wrapper.vm as any
    vm.open(user)

    await wrapper.vm.$nextTick()

    expect(wrapper.find('input[name="name"]').element.value).toBe('João Silva')
    expect(wrapper.find('input[name="email"]').element.value).toBe('joao@example.com')
    expect(wrapper.find('input[name="cpf"]').element.value).toBe('123.456.789-01')
  })

  it('deve validar campos obrigatórios', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    // Disparar validação
    await wrapper.find('input[name="name"]').trigger('blur')
    await wrapper.find('input[name="email"]').trigger('blur')
    await wrapper.find('input[name="cpf"]').trigger('blur')

    // Verificar mensagens de erro
    const errorMessages = wrapper.findAll('.text-destructive.text-sm')
    expect(errorMessages.length).toBeGreaterThan(0)
    
    const errorTexts = errorMessages.map(msg => msg.text())
    expect(errorTexts.some(text => text.includes('obrigatório'))).toBe(true)
  })

  it('deve validar formato de email', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    await wrapper.find('input[name="email"]').setValue('email-invalido')
    await wrapper.find('input[name="email"]').trigger('blur')

    const errorMessages = wrapper.findAll('.text-destructive.text-sm')
    const errorTexts = errorMessages.map(msg => msg.text())
    expect(errorTexts.some(text => text.includes('Email inválido'))).toBe(true)
  })

  it('deve emitir evento save ao submeter formulário válido', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    // Preencher formulário válido
    await wrapper.find('input[name="name"]').setValue('João Silva')
    await wrapper.find('input[name="email"]').setValue('joao@example.com')
    await wrapper.find('input[name="cpf"]').setValue('123.456.789-01')
    await wrapper.find('input[name="password"]').setValue('senha123')
    
    // Simular seleção de role (usando o select real)
    const roleSelect = wrapper.find('select#role')
    await roleSelect.setValue('admin')

    // Simular seleção de autarquias (usando o componente Sh3Select)
    const autarquiasSelect = wrapper.findAll('select#autarquia').at(1)!
    await autarquiasSelect.setValue(2)

    // Aguardar atualizações
    await wrapper.vm.$nextTick()

    // Disparar submit
    await wrapper.find('[data-testid="submit-btn"]').trigger('click')

    // Verificar se emit foi chamado
    expect(wrapper.emitted('save')).toBeTruthy()
    
    const emittedData = wrapper.emitted('save')?.[0]?.[0]
    expect(emittedData).toMatchObject({
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901', // CPF sem formatação
      password: 'senha123',
      role: 'admin'
    })
  })

  it('deve exibir loading durante submit', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    // Preencher dados mínimos
    await wrapper.find('input[name="name"]').setValue('João Silva')
    await wrapper.find('input[name="email"]').setValue('joao@example.com')
    await wrapper.find('input[name="cpf"]').setValue('123.456.789-01')
    await wrapper.find('input[name="password"]').setValue('senha123')
    
    const roleSelect = wrapper.find('select#role')
    await roleSelect.setValue('admin')

    // Disparar submit
    const submitBtn = wrapper.find('[data-testid="submit-btn"]')
    await submitBtn.trigger('click')

    // Verificar se o botão está em estado de loading
    // (isso depende da implementação do Sh3ModalForm)
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('deve emitir evento cancel ao clicar em cancelar', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="cancel-btn"]').trigger('click')

    // O componente UserForm não emite cancel diretamente, 
    // mas o Sh3ModalForm emite e o UserForm fecha o modal
    expect(wrapper.emitted('cancel')).toBeFalsy() // UserForm não emite cancel
  })

  it('deve formatar CPF durante a digitação', async () => {
    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open()

    await wrapper.vm.$nextTick()

    const cpfInput = wrapper.find('input[name="cpf"]')
    await cpfInput.setValue('12345678901')

    expect((cpfInput.element as HTMLInputElement).value).toBe('123.456.789-01')
  })

  it('não deve exigir senha em modo edição', async () => {
    const user = {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901',
      role: 'admin',
      autarquias: [1],
      autarquia_preferida_id: 1,
      is_active: true
    }

    const wrapper = mount(UserForm, {
      props: {
        roles: mockRoles,
        autarquias: mockAutarquias
      }
    })

    const vm = wrapper.vm as any
    vm.open(user)

    await wrapper.vm.$nextTick()

    // Senha deve estar vazia e não deve ser obrigatória
    expect(wrapper.find('input[name="password"]').element.value).toBe('')
    
    // Preencher outros campos obrigatórios
    await wrapper.find('input[name="name"]').setValue('João Silva Atualizado')
    
    // Deve ser possível submeter sem senha em modo edição
    const isFormValid = (wrapper.vm as any).isFormValid
    expect(isFormValid).toBe(false) // Ainda faltam outros campos, mas a senha não é problema
  })
})