# User Service - Gestão de Autarquias (N:N)

## 📋 Visão Geral

Este documento demonstra como usar os novos métodos do `userService` para gerenciar a relação N:N entre Usuários e Autarquias.

## 🔧 Interfaces

### UserAutarquiaPivot
```typescript
interface UserAutarquiaPivot {
  role: string              // Role do usuário na autarquia (ex: 'admin', 'user')
  is_admin: boolean         // Se o usuário é admin da autarquia
  is_default: boolean       // Se é a autarquia padrão do usuário
  ativo: boolean            // Se o vínculo está ativo
  data_vinculo: string      // Data de vinculação
}
```

### AutarquiaWithPivot
```typescript
interface AutarquiaWithPivot extends Autarquia {
  pivot: UserAutarquiaPivot  // Dados da tabela pivot
}
```

### User (Atualizada)
```typescript
interface User {
  id: number
  name: string
  email: string
  cpf: string
  role: string
  is_superadmin: boolean
  is_active: boolean
  autarquia_ativa_id?: number | null      // ID da autarquia ativa
  autarquia_ativa?: Autarquia | null      // Objeto da autarquia ativa
  autarquias?: AutarquiaWithPivot[]       // Array de autarquias do usuário
}
```

## 📚 Métodos Disponíveis

### 1. getUserAutarquias()

Busca todas as autarquias vinculadas a um usuário específico.

**Uso:**
```typescript
import { userService } from '@/services/user.service'

// Buscar autarquias do usuário ID 1
const autarquias = await userService.getUserAutarquias(1)

console.log(autarquias)
// [
//   {
//     id: 1,
//     nome: "Prefeitura Municipal",
//     ativo: true,
//     pivot: {
//       role: "admin",
//       is_admin: true,
//       is_default: true,
//       ativo: true,
//       data_vinculo: "2025-01-15T10:30:00Z"
//     }
//   },
//   {
//     id: 2,
//     nome: "Câmara Municipal",
//     ativo: true,
//     pivot: {
//       role: "user",
//       is_admin: false,
//       is_default: false,
//       ativo: true,
//       data_vinculo: "2025-01-20T14:00:00Z"
//     }
//   }
// ]

// Acessar dados da pivot
autarquias.forEach(autarquia => {
  console.log(`${autarquia.nome} - Role: ${autarquia.pivot.role}`)
})
```

**Componente Vue:**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService, type AutarquiaWithPivot } from '@/services/user.service'

const userId = ref(1)
const autarquias = ref<AutarquiaWithPivot[]>([])
const loading = ref(false)

async function loadAutarquias() {
  try {
    loading.value = true
    autarquias.value = await userService.getUserAutarquias(userId.value)
  } catch (error) {
    console.error('Erro ao carregar autarquias:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAutarquias()
})
</script>

<template>
  <div>
    <h2>Autarquias do Usuário</h2>
    <ul v-if="!loading">
      <li v-for="autarquia in autarquias" :key="autarquia.id">
        {{ autarquia.nome }}
        <span v-if="autarquia.pivot.is_admin">(Admin)</span>
        <span v-else>({{ autarquia.pivot.role }})</span>
      </li>
    </ul>
    <p v-else>Carregando...</p>
  </div>
</template>
```

---

### 2. attachAutarquias()

Anexa uma ou mais autarquias a um usuário.

**Uso Básico:**
```typescript
// Anexar autarquias sem dados customizados da pivot
await userService.attachAutarquias(1, [1, 2, 3])
```

**Uso com Dados da Pivot:**
```typescript
// Anexar autarquias como admin
await userService.attachAutarquias(1, [4, 5], {
  role: 'admin',
  is_admin: true,
  ativo: true
})
```

**Componente Vue - Formulário de Anexação:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { userService, type UserAutarquiaPivot } from '@/services/user.service'

const userId = ref(1)
const selectedAutarquias = ref<number[]>([])
const isAdmin = ref(false)

async function handleAttach() {
  try {
    const pivotData: Partial<UserAutarquiaPivot> = {
      role: isAdmin.value ? 'admin' : 'user',
      is_admin: isAdmin.value,
      ativo: true
    }

    await userService.attachAutarquias(
      userId.value,
      selectedAutarquias.value,
      pivotData
    )

    alert('Autarquias anexadas com sucesso!')
    selectedAutarquias.value = []
    isAdmin.value = false
  } catch (error) {
    alert('Erro ao anexar autarquias')
  }
}
</script>

<template>
  <form @submit.prevent="handleAttach">
    <h3>Anexar Autarquias ao Usuário</h3>

    <!-- Aqui você usaria um multi-select para escolher autarquias -->
    <label>
      <input type="checkbox" v-model="isAdmin" />
      Anexar como Admin?
    </label>

    <button type="submit">Anexar</button>
  </form>
</template>
```

---

### 3. detachAutarquias()

Desanexa uma ou mais autarquias de um usuário.

**Uso:**
```typescript
// Desanexar autarquias específicas
await userService.detachAutarquias(1, [2, 3])
```

**Componente Vue - Remover Autarquia:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { userService, type AutarquiaWithPivot } from '@/services/user.service'

const userId = ref(1)
const autarquias = ref<AutarquiaWithPivot[]>([])

async function removeAutarquia(autarquiaId: number) {
  if (!confirm('Deseja realmente remover esta autarquia?')) return

  try {
    await userService.detachAutarquias(userId.value, [autarquiaId])

    // Remove da lista local
    autarquias.value = autarquias.value.filter(a => a.id !== autarquiaId)

    alert('Autarquia removida com sucesso!')
  } catch (error) {
    alert('Erro ao remover autarquia')
  }
}
</script>

<template>
  <ul>
    <li v-for="autarquia in autarquias" :key="autarquia.id">
      {{ autarquia.nome }}
      <button @click="removeAutarquia(autarquia.id)">Remover</button>
    </li>
  </ul>
</template>
```

---

### 4. syncAutarquias()

Sincroniza as autarquias de um usuário (remove todas as existentes e adiciona apenas as fornecidas).

**Uso:**
```typescript
import { userService, type SyncAutarquiasPayload } from '@/services/user.service'

const autarquiasToSync: SyncAutarquiasPayload[] = [
  {
    id: 1,
    pivot_data: {
      role: 'admin',
      is_admin: true,
      is_default: true,
      ativo: true
    }
  },
  {
    id: 2,
    pivot_data: {
      role: 'user',
      is_admin: false,
      is_default: false,
      ativo: true
    }
  },
  {
    id: 3,
    pivot_data: {
      role: 'viewer',
      is_admin: false,
      is_default: false,
      ativo: true
    }
  }
]

// Sincronizar - remove todas as outras e mantém apenas estas 3
await userService.syncAutarquias(1, autarquiasToSync)
```

**Componente Vue - Editor de Autarquias:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { userService, type SyncAutarquiasPayload } from '@/services/user.service'

interface AutarquiaForm {
  autarquiaId: number
  role: string
  isAdmin: boolean
}

const userId = ref(1)
const selectedAutarquias = ref<AutarquiaForm[]>([])

async function handleSync() {
  try {
    const payload: SyncAutarquiasPayload[] = selectedAutarquias.value.map(item => ({
      id: item.autarquiaId,
      pivot_data: {
        role: item.role,
        is_admin: item.isAdmin,
        ativo: true
      }
    }))

    await userService.syncAutarquias(userId.value, payload)
    alert('Autarquias sincronizadas com sucesso!')
  } catch (error) {
    alert('Erro ao sincronizar autarquias')
  }
}
</script>

<template>
  <form @submit.prevent="handleSync">
    <h3>Gerenciar Autarquias do Usuário</h3>

    <div v-for="(item, index) in selectedAutarquias" :key="index">
      <!-- Select de autarquia -->
      <select v-model="item.role">
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="viewer">Viewer</option>
      </select>

      <label>
        <input type="checkbox" v-model="item.isAdmin" />
        É Admin?
      </label>

      <button @click="selectedAutarquias.splice(index, 1)">Remover</button>
    </div>

    <button type="submit">Sincronizar</button>
  </form>
</template>
```

---

### 5. updateActiveAutarquia()

Atualiza a autarquia ativa de um usuário.

**Uso:**
```typescript
// Definir autarquia ID 5 como ativa para o usuário ID 1
await userService.updateActiveAutarquia(1, 5)
```

**Componente Vue - Seletor de Autarquia Ativa:**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService, type AutarquiaWithPivot } from '@/services/user.service'

const userId = ref(1)
const autarquias = ref<AutarquiaWithPivot[]>([])
const autarquiaAtivaId = ref<number | null>(null)

async function loadData() {
  autarquias.value = await userService.getUserAutarquias(userId.value)
  const user = await userService.get(userId.value)
  autarquiaAtivaId.value = user.autarquia_ativa_id || null
}

async function changeActiveAutarquia() {
  if (!autarquiaAtivaId.value) return

  try {
    await userService.updateActiveAutarquia(userId.value, autarquiaAtivaId.value)
    alert('Autarquia ativa atualizada com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar autarquia ativa')
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <h3>Selecionar Autarquia Ativa</h3>
    <select v-model="autarquiaAtivaId" @change="changeActiveAutarquia">
      <option :value="null">Selecione uma autarquia</option>
      <option
        v-for="autarquia in autarquias"
        :key="autarquia.id"
        :value="autarquia.id"
      >
        {{ autarquia.nome }}
        <span v-if="autarquia.pivot.is_admin">(Admin)</span>
      </option>
    </select>
  </div>
</template>
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Painel de Gerenciamento de Autarquias

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService, type AutarquiaWithPivot, type SyncAutarquiasPayload } from '@/services/user.service'
import { autarquiaService, type Autarquia } from '@/services/autarquia.service'

const userId = ref(1)
const userAutarquias = ref<AutarquiaWithPivot[]>([])
const allAutarquias = ref<Autarquia[]>([])
const loading = ref(false)

interface AutorquiaSelection {
  id: number
  selected: boolean
  role: string
  isAdmin: boolean
}

const selections = ref<AutorquiaSelection[]>([])

async function loadData() {
  loading.value = true
  try {
    // Carregar todas as autarquias do sistema
    allAutarquias.value = await autarquiaService.list()

    // Carregar autarquias do usuário
    userAutarquias.value = await userService.getUserAutarquias(userId.value)

    // Criar seleções
    selections.value = allAutarquias.value.map(autarquia => {
      const userAutarquia = userAutarquias.value.find(ua => ua.id === autarquia.id)
      return {
        id: autarquia.id,
        selected: !!userAutarquia,
        role: userAutarquia?.pivot.role || 'user',
        isAdmin: userAutarquia?.pivot.is_admin || false
      }
    })
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  const selectedAutarquias = selections.value
    .filter(s => s.selected)
    .map(s => ({
      id: s.id,
      pivot_data: {
        role: s.role,
        is_admin: s.isAdmin,
        ativo: true
      }
    })) as SyncAutarquiasPayload[]

  try {
    await userService.syncAutarquias(userId.value, selectedAutarquias)
    alert('Alterações salvas com sucesso!')
    await loadData() // Recarregar
  } catch (error) {
    alert('Erro ao salvar alterações')
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="panel">
    <h2>Gerenciar Autarquias do Usuário</h2>

    <table v-if="!loading">
      <thead>
        <tr>
          <th>Selecionado</th>
          <th>Autarquia</th>
          <th>Role</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="selection in selections" :key="selection.id">
          <td>
            <input type="checkbox" v-model="selection.selected" />
          </td>
          <td>
            {{ allAutarquias.find(a => a.id === selection.id)?.nome }}
          </td>
          <td>
            <select v-model="selection.role" :disabled="!selection.selected">
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </td>
          <td>
            <input
              type="checkbox"
              v-model="selection.isAdmin"
              :disabled="!selection.selected"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="saveChanges" :disabled="loading">
      Salvar Alterações
    </button>
  </div>
</template>
```

### Caso 2: Adicionar Autarquia Específica

```typescript
// Handler simples para adicionar uma autarquia específica
async function addAutarquiaToUser(userId: number, autarquiaId: number, asAdmin = false) {
  try {
    await userService.attachAutarquias(userId, [autarquiaId], {
      role: asAdmin ? 'admin' : 'user',
      is_admin: asAdmin,
      ativo: true
    })
    console.log('Autarquia adicionada com sucesso!')
  } catch (error) {
    console.error('Erro ao adicionar autarquia:', error)
    throw error
  }
}

// Uso
await addAutarquiaToUser(1, 5, true) // Adiciona autarquia 5 como admin
```

### Caso 3: Transferir Usuário Entre Autarquias

```typescript
async function transferUserBetweenAutarquias(
  userId: number,
  fromAutarquiaId: number,
  toAutarquiaId: number
) {
  try {
    // Remover da autarquia antiga
    await userService.detachAutarquias(userId, [fromAutarquiaId])

    // Adicionar na autarquia nova
    await userService.attachAutarquias(userId, [toAutarquiaId], {
      role: 'user',
      is_admin: false,
      ativo: true
    })

    // Atualizar autarquia ativa
    await userService.updateActiveAutarquia(userId, toAutarquiaId)

    console.log('Usuário transferido com sucesso!')
  } catch (error) {
    console.error('Erro ao transferir usuário:', error)
    throw error
  }
}
```

---

## 🔍 Tratamento de Erros

Todos os métodos podem lançar erros. É importante tratá-los adequadamente:

```typescript
try {
  await userService.attachAutarquias(1, [999]) // ID inexistente
} catch (error: any) {
  if (error.response?.status === 404) {
    console.error('Autarquia não encontrada')
  } else if (error.response?.status === 403) {
    console.error('Sem permissão')
  } else {
    console.error('Erro desconhecido:', error.message)
  }
}
```

---

## 📝 Notas Importantes

1. **Validação no Backend**: O backend valida se as autarquias existem antes de anexar/sincronizar
2. **Autarquia Ativa**: Ao atualizar a autarquia ativa, o backend verifica se o usuário está vinculado a ela
3. **Dados da Pivot**: Se não fornecidos, são aplicados valores padrão (role: 'user', is_admin: false, etc.)
4. **Sync vs Attach**: Use `sync` quando quiser substituir todas as autarquias, e `attach` para adicionar novas
5. **Detach**: Não é possível desanexar a última autarquia se for a autarquia ativa (deve-se mudar a ativa primeiro)

---

## 🚀 Próximos Passos

1. Implementar UI de gerenciamento de autarquias
2. Adicionar testes unitários para os métodos
3. Criar composable reutilizável: `useUserAutarquias(userId)`
4. Adicionar cache/estado global com Pinia se necessário
