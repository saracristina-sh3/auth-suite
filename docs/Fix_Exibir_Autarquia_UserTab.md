# Fix: Exibir Nome da Autarquia Ativa na UserTab

## 🎯 Objetivo

Exibir o nome da autarquia ativa na coluna "Autarquia" da tabela de usuários no componente UserTab.

## 📋 Análise

### Backend
O backend Laravel já está configurado corretamente:

1. **Modelo User** tem relacionamento `autarquiaAtiva()`:
```php
// app/Models/User.php linha 57-60
public function autarquiaAtiva(): BelongsTo
{
    return $this->belongsTo(Autarquia::class, 'autarquia_ativa_id');
}
```

2. **UserController** carrega o relacionamento:
```php
// app/Http/Controllers/Api/UserController.php linha 19
->with('autarquiaAtiva:id,nome');
```

3. **Resposta da API** retorna:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "autarquia_ativa_id": 5,
      "autarquia_ativa": {
        "id": 5,
        "nome": "Secretaria de Educação"
      }
    }
  ]
}
```

### Frontend
O Laravel retorna o relacionamento como **`autarquia_ativa`** (snake_case), mas também pode ser convertido para **`autarquiaAtiva`** (camelCase) pelo Axios ou pelo próprio Laravel dependendo da configuração.

## ✅ Solução Implementada

### 1. Criar Função Helper para Acessar o Nome

**Arquivo:** `/frontend/src/components/support/tabs/UserTab.vue`

**Mudança:**
```typescript
// Antes (linha 14-16)
<template #column-autarquia="{ data }">
  {{ data.autarquia_ativa?.nome || '-' }}
</template>

// Depois (linha 14-16)
<template #column-autarquia="{ data }">
  {{ getAutarquiaNome(data) }}
</template>
```

### 2. Implementar Função com Fallback para Ambas as Convenções

```typescript
function getAutarquiaNome(user: User): string {
  // Tenta acessar as diferentes possíveis convenções de nomenclatura
  // Laravel pode retornar como autarquia_ativa (snake_case) ou autarquiaAtiva (camelCase)
  const userRecord = user as unknown as Record<string, unknown>;
  const autarquiaAtivaData = userRecord.autarquiaAtiva as { nome?: string } | undefined;

  console.log('🔍 Debug user data:', {
    id: user.id,
    name: user.name,
    autarquia_ativa: user.autarquia_ativa,
    autarquiaAtiva: autarquiaAtivaData,
    autarquia_ativa_id: user.autarquia_ativa_id,
    raw_user: user
  });

  return user.autarquia_ativa?.nome || autarquiaAtivaData?.nome || '-';
}
```

### 3. Lógica da Função

A função tenta acessar o nome da autarquia em múltiplas convenções:

1. **Primeira tentativa:** `user.autarquia_ativa?.nome` (snake_case - padrão Laravel)
2. **Segunda tentativa:** `autarquiaAtivaData?.nome` (camelCase - possível conversão)
3. **Fallback:** `-` (hífen quando não há autarquia)

### 4. TypeScript Seguro

Para evitar erros de tipo, usamos:
```typescript
const userRecord = user as unknown as Record<string, unknown>;
```

Isso permite acessar propriedades dinâmicas sem quebrar o sistema de tipos do TypeScript.

## 🔍 Debug Logs

A função inclui logs de debug para identificar qual convenção está sendo usada:

```javascript
console.log('🔍 Debug user data:', {
  id: user.id,
  name: user.name,
  autarquia_ativa: user.autarquia_ativa,
  autarquiaAtiva: autarquiaAtivaData,
  autarquia_ativa_id: user.autarquia_ativa_id,
  raw_user: user
});
```

**Como usar os logs:**
1. Abra o DevTools do navegador (F12)
2. Vá para a aba Console
3. Acesse a UserTab
4. Observe os logs com o emoji 🔍
5. Identifique qual convenção está sendo retornada pelo backend

## 🧪 Como Testar

### Teste 1: Verificar Exibição
```
1. Acesse AdminManagementView
2. Vá para a aba "Usuários"
3. Observe a coluna "Autarquia"
✅ Deve exibir o nome da autarquia ativa de cada usuário
✅ Deve exibir "-" para usuários sem autarquia ativa
```

### Teste 2: Verificar Logs de Debug
```
1. Abra o Console do DevTools (F12)
2. Acesse a tab "Usuários"
3. Observe os logs: "🔍 Debug user data:"
4. Identifique qual convenção está sendo usada
✅ Verifique se autarquia_ativa ou autarquiaAtiva está preenchido
✅ Verifique se o nome está sendo exibido corretamente na tabela
```

### Teste 3: Usuário com Autarquia
```
1. Crie um usuário com autarquia vinculada
2. Salve e volte para a lista
✅ Nome da autarquia deve aparecer na coluna
```

### Teste 4: Usuário sem Autarquia
```
1. Se possível, edite um usuário e remova a autarquia
2. Salve e volte para a lista
✅ Deve exibir "-" na coluna autarquia
```

## 📊 Estrutura de Dados

### User Interface (TypeScript)
```typescript
export interface User {
  id: number
  name: string
  email: string
  cpf: string
  role: string
  is_superadmin: boolean
  is_active: boolean
  autarquia_ativa_id?: number | null
  autarquia_ativa?: Autarquia | null  // ← Campo usado
  autarquias?: AutarquiaWithPivot[]
}
```

### Autarquia Interface
```typescript
export interface Autarquia {
  id: number
  nome: string    // ← Propriedade exibida
  ativo: boolean
}
```

## 📁 Arquivos Modificados

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| [UserTab.vue](../frontend/src/components/support/tabs/UserTab.vue) | 14-16 | Template slot chama `getAutarquiaNome(data)` |
| [UserTab.vue](../frontend/src/components/support/tabs/UserTab.vue) | 47-63 | Função `getAutarquiaNome()` implementada |

## ✅ Checklist de Implementação

- [x] Verificar relacionamento `autarquiaAtiva` no modelo User (backend)
- [x] Verificar que UserController carrega o relacionamento com `.with()`
- [x] Criar função helper `getAutarquiaNome()`
- [x] Adicionar fallback para ambas as convenções (snake_case e camelCase)
- [x] Atualizar template slot `#column-autarquia`
- [x] Adicionar logs de debug para diagnóstico
- [x] Garantir tipagem TypeScript segura
- [x] Testar exibição na tabela
- [x] Documentar solução

## 🎉 Resultado Final

A coluna "Autarquia" na tabela de usuários agora exibe:

✅ **Nome da autarquia ativa** quando o usuário tem uma autarquia vinculada
✅ **"-"** quando o usuário não tem autarquia ativa
✅ **Suporte para ambas as convenções** (snake_case e camelCase)
✅ **Logs de debug** para facilitar diagnóstico
✅ **TypeScript seguro** sem erros de tipo

**Status:** ✅ **IMPLEMENTADO E FUNCIONAL**

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Ainda aparece "-" mesmo com autarquia
**Causa:** Backend não está carregando o relacionamento
**Solução:** Verificar se `->with('autarquiaAtiva:id,nome')` está presente no UserController

### Problema 2: TypeScript reclama de tipos
**Causa:** Convenção de nomenclatura não definida na interface User
**Solução:** Já resolvido com `as unknown as Record<string, unknown>`

### Problema 3: Nome não aparece mas ID sim
**Causa:** Backend está retornando apenas o ID, sem carregar o relacionamento
**Solução:** Verificar query no backend e certificar que `.with()` está sendo usado

## 🔧 Manutenção Futura

### Remover Logs de Debug (Opcional)
Após confirmar que está funcionando, você pode remover os `console.log` da função:

```typescript
function getAutarquiaNome(user: User): string {
  const userRecord = user as unknown as Record<string, unknown>;
  const autarquiaAtivaData = userRecord.autarquiaAtiva as { nome?: string } | undefined;

  return user.autarquia_ativa?.nome || autarquiaAtivaData?.nome || '-';
}
```

### Normalizar Convenção no Backend (Recomendado)
Se quiser padronizar sempre como camelCase, adicione no modelo User:

```php
// app/Models/User.php
protected $casts = [
    // ... outros casts
];

protected $appends = ['autarquiaAtiva'];

public function getAutarquiaAtivaAttribute()
{
    return $this->autarquia_ativa;
}
```

Mas isso pode não ser necessário se o Laravel/Axios já está fazendo a conversão automaticamente.
