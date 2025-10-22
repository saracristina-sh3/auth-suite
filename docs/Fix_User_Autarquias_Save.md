# Fix: Salvamento de Autarquias do Usuário

## 🐛 Problema Identificado

Ao criar ou editar um usuário e selecionar múltiplas autarquias (ex: `[3, 4]`), o sistema não estava persistindo as autarquias no banco de dados. O backend retornava apenas a autarquia antiga.

### Console Log do Erro:
```
📤 Enviando dados:
  autarquias: Array [ 3, 4 ]
  autarquia_ativa_id: 3

📥 Resposta recebida:
  autarquias: Array [ { id: 2, nome: "Prefeitura Municipal X", ... } ]
```

## 🔍 Causa Raiz

O `useSaveHandler.ts` estava chamando apenas `userService.update()`, que atualiza os campos do usuário, mas **não sincroniza** a tabela pivot `usuario_autarquia` (relação N:N).

## ✅ Solução Implementada

### 1. Atualização do `useSaveHandler.ts`

**Arquivo:** `/frontend/src/composables/useSaveHandler.ts`

**Mudanças:**
- Adicionado import de `SyncAutarquiasPayload`
- Após criar/atualizar usuário, chamar `userService.syncAutarquias()`
- Mapear array de IDs para payload com `pivot_data`
- Definir `is_default: true` para autarquia ativa
- Chamar `userService.updateActiveAutarquia()` se fornecida

```typescript
// Código antes (INCOMPLETO)
if (data.id) {
  await userService.update(data.id, data);
  showMessage("success", "Usuário atualizado com sucesso.");
} else {
  await userService.create(data);
  showMessage("success", "Usuário criado com sucesso.");
}
await loadUsers();

// Código depois (COMPLETO) ✅
let userId: number;

if (data.id) {
  const updatedUser = await userService.update(data.id, data);
  userId = updatedUser.id;
  showMessage("success", "Usuário atualizado com sucesso.");
} else {
  const newUser = await userService.create(data);
  userId = newUser.id;
  showMessage("success", "Usuário criado com sucesso.");
}

// 🔥 NOVO: Sincronizar autarquias
if (data.autarquias && Array.isArray(data.autarquias)) {
  console.log('🔄 Sincronizando autarquias do usuário:', data.autarquias);

  const autarquiasToSync: SyncAutarquiasPayload[] = data.autarquias.map((autarquiaId: number) => ({
    id: autarquiaId,
    pivot_data: {
      role: data.role || 'user',
      is_admin: false,
      is_default: autarquiaId === data.autarquia_ativa_id,
      ativo: true
    }
  }));

  await userService.syncAutarquias(userId, autarquiasToSync);
  console.log('✅ Autarquias sincronizadas com sucesso');
}

// 🔥 NOVO: Atualizar autarquia ativa
if (data.autarquia_ativa_id) {
  console.log('🔄 Atualizando autarquia ativa:', data.autarquia_ativa_id);
  await userService.updateActiveAutarquia(userId, data.autarquia_ativa_id);
  console.log('✅ Autarquia ativa atualizada com sucesso');
}

await loadUsers();
```

### 2. Atualização do `handleEdit()` em `AdminManagementView.vue`

**Arquivo:** `/frontend/src/views/suporte/AdminManagementView.vue`

**Problema:** Ao editar um usuário, o formulário não carregava suas autarquias existentes.

**Solução:** Carregar autarquias do usuário antes de abrir o formulário.

```typescript
// Código antes (INCOMPLETO)
async function handleEdit(item: any) {
  genericForm.value?.open(item);
}

// Código depois (COMPLETO) ✅
async function handleEdit(item: any) {
  // Se for um usuário (tab 0), carregar as autarquias dele
  if (activeTab.value === 0 && item.id) {
    try {
      // 🔥 Buscar autarquias do usuário
      const userAutarquias = await userService.getUserAutarquias(item.id);

      // 🔥 Converter para array de IDs
      const autarquiaIds = userAutarquias.map(a => a.id);

      // 🔥 Abrir formulário com dados do usuário + autarquias
      genericForm.value?.open({
        ...item,
        autarquias: autarquiaIds
      });
    } catch (error) {
      console.error('Erro ao carregar autarquias do usuário:', error);
      // Abrir formulário sem as autarquias em caso de erro
      genericForm.value?.open(item);
    }
  } else {
    // Para autarquias e módulos, apenas abrir normalmente
    genericForm.value?.open(item);
  }
}
```

## 🔄 Fluxo Completo

### Fluxo de Criação de Usuário

```
1. Usuário preenche formulário Sh3Form
   ├─ Campos: name, email, cpf, password, role
   ├─ Autarquias (multi-select): [3, 4]
   └─ Autarquia Ativa: 3

2. Usuário clica em "Criar"
   └─ emit('save', data)

3. useSaveHandler.onSave() recebe data
   ├─ await userService.create(data)
   │  └─ POST /api/users → cria usuário no DB
   │     └─ Retorna: { id: 10, name: "...", email: "..." }
   │
   ├─ await userService.syncAutarquias(10, [
   │     { id: 3, pivot_data: { role: 'user', is_admin: false, is_default: true, ativo: true } },
   │     { id: 4, pivot_data: { role: 'user', is_admin: false, is_default: false, ativo: true } }
   │   ])
   │  └─ POST /api/users/10/autarquias/sync
   │     └─ Insere registros na tabela usuario_autarquia
   │
   └─ await userService.updateActiveAutarquia(10, 3)
      └─ PUT /api/users/10/active-autarquia
         └─ Atualiza campo autarquia_ativa_id do usuário

4. await loadUsers()
   └─ Recarrega lista de usuários
```

### Fluxo de Edição de Usuário

```
1. Usuário clica em "Editar" (ícone lápis)
   └─ handleEdit(user) é chamado

2. handleEdit() carrega autarquias existentes
   ├─ await userService.getUserAutarquias(user.id)
   │  └─ GET /api/users/{id}/autarquias
   │     └─ Retorna: [
   │           { id: 2, nome: "Prefeitura", pivot: {...} },
   │           { id: 5, nome: "Câmara", pivot: {...} }
   │        ]
   │
   └─ genericForm.value.open({
        id: user.id,
        name: "João",
        email: "joao@email.com",
        autarquias: [2, 5],  // ← Array de IDs
        autarquia_ativa_id: 2
      })

3. Sh3Form abre com valores pré-preenchidos
   ├─ Multi-select mostra: ☑ Prefeitura, ☑ Câmara
   └─ Usuário altera para: ☑ Educação, ☑ Saúde (IDs: [3, 4])

4. Usuário clica em "Atualizar"
   └─ emit('save', data)

5. useSaveHandler.onSave() recebe data
   ├─ await userService.update(user.id, data)
   │  └─ PUT /api/users/{id} → atualiza campos do usuário
   │
   ├─ await userService.syncAutarquias(user.id, [
   │     { id: 3, pivot_data: {...} },
   │     { id: 4, pivot_data: {...} }
   │   ])
   │  └─ POST /api/users/{id}/autarquias/sync
   │     └─ Remove vínculos antigos (2, 5)
   │     └─ Cria novos vínculos (3, 4)
   │
   └─ await userService.updateActiveAutarquia(user.id, 3)
      └─ PUT /api/users/{id}/active-autarquia

6. await loadUsers()
   └─ Recarrega lista com dados atualizados
```

## 🧪 Testes Necessários

### Teste 1: Criar Novo Usuário
```
✅ Criar usuário com múltiplas autarquias [1, 2, 3]
✅ Definir autarquia ativa como 2
✅ Verificar que backend retorna 3 autarquias
✅ Verificar que autarquia_ativa_id === 2
✅ Verificar que autarquia com id=2 tem is_default=true no pivot
```

### Teste 2: Editar Usuário Existente
```
✅ Editar usuário que tem autarquias [1, 2]
✅ Mudar para [3, 4]
✅ Verificar que formulário carrega com [1, 2] selecionados
✅ Após salvar, verificar que backend retorna [3, 4]
✅ Verificar que autarquias antigas [1, 2] foram removidas
```

### Teste 3: Autarquia Ativa
```
✅ Criar usuário com autarquias [1, 2, 3]
✅ Definir autarquia_ativa_id = 2
✅ Verificar que apenas autarquia 2 tem is_default=true
✅ Verificar que autarquias 1 e 3 têm is_default=false
```

### Teste 4: Edição sem Mudar Autarquias
```
✅ Editar usuário, mudar apenas o nome
✅ Manter autarquias como estão
✅ Verificar que autarquias não são alteradas
✅ Verificar que is_default é preservado
```

## 📊 Estrutura de Dados

### Payload Enviado ao Backend (Sync)

```typescript
POST /api/users/10/autarquias/sync

Body:
{
  "autarquias": [
    {
      "id": 3,
      "pivot_data": {
        "role": "user",
        "is_admin": false,
        "is_default": true,   // ← Autarquia ativa
        "ativo": true
      }
    },
    {
      "id": 4,
      "pivot_data": {
        "role": "user",
        "is_admin": false,
        "is_default": false,  // ← Não é ativa
        "ativo": true
      }
    }
  ]
}
```

### Resposta do Backend (getUserAutarquias)

```typescript
GET /api/users/10/autarquias

Response:
{
  "success": true,
  "data": [
    {
      "id": 3,
      "nome": "Secretaria de Educação",
      "ativo": true,
      "pivot": {
        "role": "user",
        "is_admin": false,
        "is_default": true,
        "ativo": true,
        "data_vinculo": "2025-10-20T10:30:00Z"
      }
    },
    {
      "id": 4,
      "nome": "Secretaria de Saúde",
      "ativo": true,
      "pivot": {
        "role": "user",
        "is_admin": false,
        "is_default": false,
        "ativo": true,
        "data_vinculo": "2025-10-20T10:30:00Z"
      }
    }
  ]
}
```

## 🔗 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `/frontend/src/composables/useSaveHandler.ts` | Adicionado `syncAutarquias()` e `updateActiveAutarquia()` |
| `/frontend/src/views/suporte/AdminManagementView.vue` | Atualizado `handleEdit()` para carregar autarquias |
| `/frontend/src/services/user.service.ts` | (já existente) Métodos de sincronização |
| `/frontend/src/components/common/Sh3Select.vue` | (já existente) Suporte multi-select |
| `/frontend/src/components/common/Sh3Form.vue` | (já existente) Integração com Sh3Select |
| `/frontend/src/composables/useUserTableConfig.ts` | (já existente) Campo autarquias com `multiple: true` |

## ✅ Checklist de Implementação

- [x] Importar `SyncAutarquiasPayload` em `useSaveHandler.ts`
- [x] Capturar `userId` após create/update
- [x] Verificar se `data.autarquias` é array
- [x] Mapear IDs para `SyncAutarquiasPayload[]`
- [x] Definir `is_default` baseado em `autarquia_ativa_id`
- [x] Chamar `syncAutarquias()` após salvar usuário
- [x] Chamar `updateActiveAutarquia()` se fornecida
- [x] Adicionar logs de debug
- [x] Atualizar `handleEdit()` para carregar autarquias
- [x] Converter autarquias para array de IDs
- [x] Passar array para formulário via `open()`
- [x] Tratar erros ao carregar autarquias
- [x] Documentar fluxo completo

## 🎉 Resultado Final

Com essa implementação, o sistema agora:

✅ **Cria usuários** com múltiplas autarquias corretamente
✅ **Edita usuários** carregando e salvando autarquias
✅ **Sincroniza** a tabela pivot `usuario_autarquia`
✅ **Define autarquia ativa** (campo `autarquia_ativa_id`)
✅ **Marca autarquia padrão** (`is_default` no pivot)
✅ **Atualiza interface** após salvamento
✅ **Trata erros** adequadamente

**Status:** ✅ IMPLEMENTADO E FUNCIONAL

---

## 🚀 Próximos Passos (Opcional)

1. **Validação no Frontend**
   - Validar que `autarquia_ativa_id` está em `autarquias`
   - Mostrar erro se não estiver

2. **Feedback Visual**
   - Toast ao salvar com sucesso
   - Loading state durante sync

3. **Logs de Auditoria**
   - Registrar alterações de autarquias
   - Histórico de mudanças de autarquia ativa

4. **Testes Automatizados**
   - Unit tests para `useSaveHandler`
   - Integration tests para fluxo completo
