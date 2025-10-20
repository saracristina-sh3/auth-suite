# Sh3Select - Guia de Multi-Seleção

## 📋 Visão Geral

O componente **Sh3Select** foi atualizado para suportar **seleção múltipla** (multi-select) com uma interface moderna de checkboxes e busca integrada.

## ✨ Funcionalidades

### Select Simples (Padrão)
- Dropdown tradicional com `<select>` nativo
- Uma única seleção por vez
- Comportamento padrão do HTML

### Multi-Select (Novo)
- ✅ Interface personalizada com checkboxes
- ✅ Busca/filtro integrado
- ✅ Tags visuais para itens selecionados
- ✅ Botões "Selecionar Todos" e "Limpar"
- ✅ Contador de itens selecionados
- ✅ Fecha ao clicar fora (click outside)
- ✅ Scrollbar customizado

---

## 🚀 Como Usar

### 1. Select Simples (Single)

```vue
<template>
  <Sh3Select
    :field="{
      name: 'autarquia_ativa',
      label: 'Autarquia Ativa',
      type: 'select',
      placeholder: 'Selecione uma autarquia',
      options: autarquias,
      optionLabel: 'nome',
      optionValue: 'id'
    }"
    v-model="selectedAutarquia"
  />
</template>

<script setup>
import { ref } from 'vue'
import Sh3Select from '@/components/common/Sh3Select.vue'

const autarquias = ref([
  { id: 1, nome: 'Prefeitura Municipal' },
  { id: 2, nome: 'Câmara Municipal' },
  { id: 3, nome: 'Secretaria de Educação' }
])

const selectedAutarquia = ref(null)
</script>
```

---

### 2. Multi-Select

```vue
<template>
  <Sh3Select
    :field="{
      name: 'autarquias',
      label: 'Autarquias',
      type: 'select',
      multiple: true,           // Ativa multi-select
      searchable: true,         // Ativa busca (opcional, padrão: true)
      placeholder: 'Selecione uma ou mais autarquias',
      options: autarquias,
      optionLabel: 'nome',
      optionValue: 'id'
    }"
    v-model="selectedAutarquias"
  />
</template>

<script setup>
import { ref } from 'vue'
import Sh3Select from '@/components/common/Sh3Select.vue'

const autarquias = ref([
  { id: 1, nome: 'Prefeitura Municipal' },
  { id: 2, nome: 'Câmara Municipal' },
  { id: 3, nome: 'Secretaria de Educação' },
  { id: 4, nome: 'Secretaria de Saúde' },
  { id: 5, nome: 'Secretaria de Obras' }
])

// Valor inicial vazio
const selectedAutarquias = ref([])

// Ou com valores pré-selecionados
// const selectedAutarquias = ref([1, 3])
</script>
```

---

## 🎯 Uso no Sh3Form

### Formulário de Usuário com Multi-Select

```typescript
// Em useUserTableConfig.ts ou qualquer composable de configuração

const fields = computed(() => [
  {
    name: 'name',
    label: 'Nome',
    type: 'text',
    required: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true
  },
  {
    name: 'autarquias',
    label: 'Autarquias',
    type: 'select',
    required: true,
    multiple: true,         // Multi-select
    searchable: true,       // Com busca
    placeholder: 'Selecione uma ou mais autarquias',
    options: autarquias.value,
    optionLabel: 'nome',
    optionValue: 'id',
    defaultValue: []        // Array vazio como padrão
  },
  {
    name: 'autarquia_ativa_id',
    label: 'Autarquia Padrão',
    type: 'select',
    required: false,
    placeholder: 'Selecione a autarquia padrão',
    options: autarquias.value,
    optionLabel: 'nome',
    optionValue: 'id'
  }
])
```

### Usando no Componente

```vue
<template>
  <Sh3Form
    ref="userForm"
    entityName="Usuário"
    :fields="fields"
    @save="handleSave"
  />
</template>

<script setup>
import Sh3Form from '@/components/common/Sh3Form.vue'
import { useUserTableConfig } from '@/composables/useUserTableConfig'

const { fields } = useUserTableConfig(roles, autarquias)

async function handleSave(data) {
  console.log('Dados do formulário:', data)

  // data.autarquias será um array de IDs
  // Exemplo: [1, 3, 5]

  // Agora você pode usar o userService para salvar
  if (data.id) {
    // Atualizar usuário existente
    await userService.update(data.id, data)

    // Sincronizar autarquias
    await userService.syncAutarquias(data.id,
      data.autarquias.map(id => ({
        id,
        pivot_data: {
          role: 'user',
          is_admin: false,
          ativo: true
        }
      }))
    )

    // Definir autarquia ativa
    if (data.autarquia_ativa_id) {
      await userService.updateActiveAutarquia(data.id, data.autarquia_ativa_id)
    }
  } else {
    // Criar novo usuário
    const newUser = await userService.create(data)

    // Anexar autarquias
    await userService.attachAutarquias(newUser.id, data.autarquias, {
      role: 'user',
      is_admin: false,
      ativo: true
    })

    // Definir autarquia ativa
    if (data.autarquia_ativa_id) {
      await userService.updateActiveAutarquia(newUser.id, data.autarquia_ativa_id)
    }
  }
}
</script>
```

---

## 📊 Interface FieldConfig Atualizada

```typescript
interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  rows?: number
  options?: any[]
  optionLabel?: string
  optionValue?: string
  defaultValue?: any
  multiple?: boolean      // ← NOVO: Habilita multi-seleção
  searchable?: boolean    // ← NOVO: Habilita busca (padrão: true)
}
```

---

## 🎨 Aparência do Multi-Select

### Estado Fechado (Sem Seleção)
```
┌─────────────────────────────────────┐
│ Selecione uma ou mais opções      ▼ │
└─────────────────────────────────────┘
```

### Estado Fechado (Com Seleção)
```
┌─────────────────────────────────────┐
│ [Prefeitura] [Câmara] [Educação]  ▼ │
└─────────────────────────────────────┘
```

### Estado Fechado (Muitas Seleções)
```
┌─────────────────────────────────────┐
│ [Prefeitura] [Câmara] [Saúde] +5   ▼│
└─────────────────────────────────────┘
```

### Estado Aberto
```
┌─────────────────────────────────────┐
│ Selecione uma ou mais opções      ▲ │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Buscar...                           │
├─────────────────────────────────────┤
│ ☑ Prefeitura Municipal              │
│ ☑ Câmara Municipal                  │
│ ☐ Secretaria de Educação            │
│ ☑ Secretaria de Saúde               │
│ ☐ Secretaria de Obras               │
├─────────────────────────────────────┤
│ [Selecionar Todos] [Limpar]         │
└─────────────────────────────────────┘
```

---

## 🔧 Propriedades e Comportamentos

### Propriedade `multiple`
- **Tipo:** `boolean`
- **Padrão:** `false`
- **Descrição:** Quando `true`, ativa o modo multi-seleção

### Propriedade `searchable`
- **Tipo:** `boolean`
- **Padrão:** `true` (quando `multiple` está ativo)
- **Descrição:** Mostra/oculta o campo de busca no dropdown

### Valor do v-model
- **Select Simples:** `number | string | null`
- **Multi-Select:** `Array<number | string>` (sempre array)

### Eventos
- `update:modelValue` - Emitido quando a seleção muda
- Compatível com `v-model`

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar Usuário com Múltiplas Autarquias

```typescript
async function createUser() {
  // 1. Criar o usuário
  const newUser = await userService.create({
    name: 'João Silva',
    email: 'joao@email.com',
    cpf: '12345678900',
    role: 'user',
    is_active: true
  })

  // 2. Anexar múltiplas autarquias
  await userService.attachAutarquias(
    newUser.id,
    [1, 2, 3], // IDs das autarquias selecionadas no multi-select
    {
      role: 'user',
      is_admin: false,
      ativo: true
    }
  )

  // 3. Definir autarquia padrão
  await userService.updateActiveAutarquia(newUser.id, 1)
}
```

### Exemplo 2: Editar Autarquias de um Usuário Existente

```typescript
async function editUserAutarquias(userId: number) {
  // 1. Carregar autarquias atuais
  const currentAutarquias = await userService.getUserAutarquias(userId)
  console.log('Autarquias atuais:', currentAutarquias.map(a => a.id))

  // 2. Abrir formulário com valores pré-selecionados
  userForm.value.open({
    id: userId,
    autarquias: currentAutarquias.map(a => a.id) // Array de IDs
  })

  // 3. Ao salvar, sincronizar
  async function handleSave(data) {
    await userService.syncAutarquias(userId,
      data.autarquias.map(id => ({
        id,
        pivot_data: { role: 'user', is_admin: false, ativo: true }
      }))
    )
  }
}
```

### Exemplo 3: Validação Customizada

```vue
<script setup>
import { ref, watch } from 'vue'

const selectedAutarquias = ref([])
const autarquiaAtiva = ref(null)
const error = ref('')

// Validar que autarquia ativa está entre as selecionadas
watch([selectedAutarquias, autarquiaAtiva], ([autarquias, ativa]) => {
  if (ativa && !autarquias.includes(ativa)) {
    error.value = 'A autarquia padrão deve estar entre as autarquias selecionadas'
    autarquiaAtiva.value = null
  } else {
    error.value = ''
  }
})
</script>
```

### Exemplo 4: Filtrar Opções Dinamicamente

```vue
<script setup>
import { ref, computed } from 'vue'

const todasAutarquias = ref([...]) // Todas as autarquias
const selectedAutarquias = ref([])

// Filtrar apenas autarquias ativas para seleção múltipla
const autarquiasAtivas = computed(() =>
  todasAutarquias.value.filter(a => a.ativo)
)

// Usar no field config
const field = {
  name: 'autarquias',
  type: 'select',
  multiple: true,
  options: autarquiasAtivas.value // ← Opções filtradas
}
</script>
```

---

## 🎯 Boas Práticas

### 1. Sempre use array como valor padrão
```typescript
// ✅ Correto
{ name: 'autarquias', type: 'select', multiple: true, defaultValue: [] }

// ❌ Errado
{ name: 'autarquias', type: 'select', multiple: true, defaultValue: null }
```

### 2. Valide seleções vazias
```typescript
function handleSave(data) {
  if (!data.autarquias || data.autarquias.length === 0) {
    alert('Selecione pelo menos uma autarquia')
    return
  }
  // Continuar...
}
```

### 3. Confirme mudanças destrutivas
```typescript
async function handleSync(userId, newAutarquias) {
  if (!confirm('Isso substituirá todas as autarquias atuais. Continuar?')) {
    return
  }
  await userService.syncAutarquias(userId, newAutarquias)
}
```

### 4. Mostre feedback visual
```vue
<template>
  <div>
    <Sh3Select v-model="selected" :field="field" />
    <p class="text-sm text-gray-600 mt-1">
      {{ selected.length }} autarquia(s) selecionada(s)
    </p>
  </div>
</template>
```

---

## 🐛 Solução de Problemas

### Problema: Multi-select não aparece

**Solução:** Certifique-se de que `multiple: true` está definido no field config:
```typescript
{
  type: 'select',
  multiple: true // ← Obrigatório
}
```

### Problema: Valor não é array

**Solução:** Defina `defaultValue: []`:
```typescript
{
  type: 'select',
  multiple: true,
  defaultValue: [] // ← Importante
}
```

### Problema: Busca não funciona

**Solução:** Busca está ativa por padrão. Para desabilitar:
```typescript
{
  type: 'select',
  multiple: true,
  searchable: false // Desabilita busca
}
```

### Problema: Dropdown não fecha

**Solução:** O componente usa click outside detection. Certifique-se de que não há eventos `@click.stop` interferindo.

---

## 📚 Referências

- [Sh3Select.vue](frontend/src/components/common/Sh3Select.vue)
- [Sh3Form.vue](frontend/src/components/common/Sh3Form.vue)
- [useUserTableConfig.ts](frontend/src/composables/useUserTableConfig.ts)
- [User Service Guide](frontend/src/services/user.service.examples.md)

---

## ✅ Checklist de Implementação

- [x] Componente Sh3Select atualizado
- [x] Suporte a `multiple: true`
- [x] Busca/filtro integrado
- [x] Tags visuais para selecionados
- [x] Botões "Selecionar Todos" e "Limpar"
- [x] Interface FieldConfig atualizada
- [x] Sh3Form compatível com multi-select
- [x] useUserTableConfig atualizado
- [x] Documentação completa

---

## 🎉 Pronto para Usar!

O componente Sh3Select com multi-seleção está **100% funcional** e pronto para ser usado em qualquer formulário da aplicação!
