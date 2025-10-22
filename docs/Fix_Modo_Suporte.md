# Fix: Modo Suporte - SuperAdmin Assumir Contexto de Autarquia

## 🐛 Problema Identificado

O **Modo Suporte** parou de funcionar. Quando o SuperAdmin selecionava uma autarquia para assumir o contexto administrativo, os módulos daquela autarquia não eram carregados corretamente.

### Sintomas:
- ✅ Backend retornava os módulos da autarquia no contexto de suporte
- ✅ Token de suporte era gerado corretamente
- ✅ Contexto de suporte era salvo no localStorage
- ❌ **Frontend não usava os módulos do contexto de suporte**
- ❌ **Tentava buscar módulos via API normal**

## 🔍 Causa Raiz

O composable `useModulos` estava ignorando o contexto de suporte armazenado no `localStorage` e sempre buscava os módulos via API baseado no `user.autarquia_ativa_id`.

**Fluxo Incorreto:**
```
1. SuperAdmin assume contexto de suporte
2. Backend retorna módulos da autarquia no response
3. support.service salva contexto em localStorage (incluindo módulos)
4. useModulos ignora o contexto e busca módulos via API
5. ❌ Módulos não aparecem ou aparecem errados
```

## ✅ Solução Implementada

Atualizado o `useModulos.ts` para **verificar primeiro** se está em modo suporte e usar os módulos do contexto salvo no `localStorage`.

### Arquivo Modificado

**`/frontend/src/composables/useModulos.ts`**

#### 1. Adicionado Import do supportService

```typescript
// ANTES
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import type { Modulo } from '@/types/auth'

// DEPOIS
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import { supportService } from '@/services/support.service'  // ← NOVO
import type { Modulo } from '@/types/auth'
```

#### 2. Atualizada Função loadModulos()

```typescript
export function useModulos() {
  const loadModulos = async () => {
    try {
      loading.value = true
      error.value = null

      // 🔍 NOVO: Verificar se está em modo suporte PRIMEIRO
      const supportContext = supportService.getSupportContext()

      if (supportContext && supportContext.support_mode) {
        // 🛡️ MODO SUPORTE ATIVO: Usar módulos do contexto de suporte
        console.log('🛡️ Modo suporte ativo - Carregando módulos do contexto:', supportContext.autarquia.nome)

        const data = supportContext.modulos || []

        // Mapeia os módulos com ícones e rotas
        modulos.value = data
          .filter(modulo => modulo.ativo !== false)
          .map(modulo => ({
            ...modulo,
            icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box',
            route: routeMap[modulo.nome] || '/',
            key: modulo.nome.toLowerCase().replace(/\s+/g, '-'),
            title: modulo.nome,
            description: modulo.descricao || `Módulo ${modulo.nome}`
          }))

        console.log('✅ Módulos do modo suporte carregados:', modulos.value.length, 'módulos')
        return  // ← Sai da função, não busca na API
      }

      // 👤 MODO NORMAL: Buscar módulos pela autarquia do usuário
      const user = authService.getUserFromStorage()

      if (!user) {
        error.value = 'Usuário não autenticado'
        modulos.value = []
        return
      }

      // ... resto do código normal
    }
  }
}
```

## 🔄 Fluxo Corrigido

### Fluxo de Assumir Contexto de Suporte

```
1. SuperAdmin acessa AdminManagementView → Tab "Modo Suporte"
    ↓
2. Seleciona uma autarquia no dropdown
    ↓
3. Clica em "Acessar"
    ↓
4. useSupportContext.handleAssumeContext() é chamado
    ↓
5. supportService.assumeAutarquiaContext(autarquiaId)
    ├─ POST /api/support/assume-context
    ├─ Body: { autarquia_ativa_id: 5 }
    └─ Backend retorna:
        {
          "success": true,
          "token": "novo-token-suporte",
          "context": {
            "autarquia": { id: 5, nome: "Secretaria de Educação" },
            "support_mode": true,
            "is_admin": true,
            "modulos": [
              { id: 1, nome: "Frota", icone: "frota_button" },
              { id: 2, nome: "Compras", icone: "compras_button" },
              ...
            ],
            "permissions": { view: true, create: true, ... }
          }
        }
    ↓
6. supportService salva no localStorage:
    ├─ localStorage.setItem('auth_token', novo_token)
    ├─ localStorage.setItem('support_context', JSON.stringify(context))
    ├─ localStorage.setItem('original_user_data', dados_originais)
    └─ localStorage.setItem('user_data', { ...user, autarquia_ativa_id: 5, role: 'admin', _support_mode: true })
    ↓
7. Router redireciona para /home (SuiteHome)
    ↓
8. useModulos.loadModulos() é chamado no onMounted
    ├─ 🔍 Verifica supportService.getSupportContext()
    ├─ ✅ Contexto encontrado com support_mode: true
    ├─ 📦 Usa modulos do contexto: supportContext.modulos
    └─ ✅ Renderiza módulos na tela
    ↓
9. ✅ SuperAdmin vê TODOS os módulos da autarquia com permissões de admin
```

### Fluxo de Sair do Modo Suporte

```
1. SuperAdmin clica em "Sair do Modo Suporte"
    ↓
2. useSupportContext.exitContext() é chamado
    ↓
3. supportService.exitAutarquiaContext()
    ├─ POST /api/support/exit-context
    ├─ Backend revoga token de suporte
    └─ Backend retorna token normal + dados originais do usuário
    ↓
4. supportService restaura dados originais:
    ├─ localStorage.setItem('auth_token', token_original)
    ├─ Restaura original_user_data → user_data
    ├─ localStorage.removeItem('support_context')
    └─ localStorage.removeItem('original_user_data')
    ↓
5. useModulos.loadModulos() é chamado novamente
    ├─ 🔍 Verifica supportService.getSupportContext()
    ├─ ❌ Contexto não encontrado (null)
    ├─ 👤 Usa modo normal: busca módulos via API
    └─ ✅ Renderiza módulos da autarquia original do superadmin
```

## 📊 Estrutura do Contexto de Suporte

### LocalStorage - support_context

```json
{
  "autarquia": {
    "id": 5,
    "nome": "Secretaria de Educação",
    "ativo": true
  },
  "support_mode": true,
  "is_admin": true,
  "modulos": [
    {
      "id": 1,
      "nome": "Frota",
      "descricao": "Gestão de Frota",
      "icone": "frota_button",
      "ativo": true
    },
    {
      "id": 2,
      "nome": "Compras",
      "descricao": "Gestão de Compras",
      "icone": "compras_button",
      "ativo": true
    }
  ],
  "permissions": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true,
    "manage_users": true,
    "manage_modules": true
  }
}
```

### LocalStorage - user_data (Modificado em Modo Suporte)

```json
{
  "id": 1,
  "name": "SuperAdmin SH3",
  "email": "admin@sh3.com.br",
  "role": "admin",              // ← Modificado de "superadmin" para "admin"
  "is_superadmin": false,       // ← Temporariamente false
  "_support_mode": true,        // ← Flag interna
  "autarquia_ativa_id": 5,      // ← ID da autarquia de suporte
  "autarquia": {
    "id": 5,
    "nome": "Secretaria de Educação",
    "ativo": true
  }
}
```

## 🧪 Como Testar

### Teste 1: Assumir Contexto de Suporte
```
1. Login como SuperAdmin (is_superadmin: true)
2. Acessar AdminManagementView
3. Ir para tab "Modo Suporte"
4. Selecionar uma autarquia no dropdown
5. Clicar em "Acessar"

✅ ESPERADO:
- Mensagem: "Modo suporte ativado para: [Nome da Autarquia]"
- Redirecionamento para /home
- Módulos da autarquia aparecem no SuiteHome
- Console mostra: "🛡️ Modo suporte ativo - Carregando módulos do contexto"
- Console mostra: "✅ Módulos do modo suporte carregados: X módulos"
```

### Teste 2: Navegar com Modo Suporte Ativo
```
1. Com modo suporte ativo, navegar para diferentes páginas
2. Voltar para /home

✅ ESPERADO:
- Módulos continuam sendo carregados do contexto de suporte
- Não fazem novas requisições à API
- Permissões de admin estão ativas
```

### Teste 3: Sair do Modo Suporte
```
1. Com modo suporte ativo, acessar AdminManagementView
2. Ir para tab "Modo Suporte"
3. Clicar em "Sair do Modo Suporte"
4. Confirmar no prompt

✅ ESPERADO:
- Mensagem: "Retornado ao contexto original"
- Módulos do superadmin aparecem (se houver autarquia vinculada)
- Console mostra modo normal: "👤 Carregando módulos da autarquia"
- support_context removido do localStorage
```

### Teste 4: Verificar localStorage
```
1. Abrir DevTools (F12) → Application → Local Storage
2. Antes de assumir contexto:
   - auth_token: presente
   - user_data: dados do superadmin
   - support_context: não existe

3. Após assumir contexto:
   - auth_token: novo token de suporte
   - user_data: modificado (role: admin, _support_mode: true)
   - support_context: objeto com autarquia e módulos
   - original_user_data: backup dos dados originais

4. Após sair do contexto:
   - auth_token: token original restaurado
   - user_data: dados originais restaurados
   - support_context: removido
   - original_user_data: removido
```

## 📁 Arquivos Envolvidos

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `/frontend/src/composables/useModulos.ts` | Adicionado verificação de modo suporte | ✅ Modificado |
| `/frontend/src/services/support.service.ts` | Já existente e funcional | ✅ OK |
| `/frontend/src/composables/useSupportContext.ts` | Já existente e funcional | ✅ OK |
| `/frontend/src/components/support/tabs/SupportContextTab.vue` | Já existente e funcional | ✅ OK |
| `/backend/app/Http/Controllers/Api/AuthController.php` | Endpoints já existentes e funcionais | ✅ OK |
| `/frontend/src/services/auth.service.ts` | Adicionado limpeza de contexto no logout e 401 | ✅ Modificado (Fase 2) |
| `/frontend/src/types/auth.ts` | Adicionado _support_mode e SupportModeUser | ✅ Modificado (Fase 2) |
| `/frontend/src/components/support/SupportContext.vue` | Componente duplicado | ✅ Removido (Fase 2) |

## ✅ Checklist de Correção

### Primeira Fase (Correção Principal)
- [x] Identificar que useModulos não verificava modo suporte
- [x] Adicionar import do supportService em useModulos.ts
- [x] Adicionar verificação de supportContext no início de loadModulos()
- [x] Carregar módulos do contexto quando support_mode === true
- [x] Manter fluxo normal quando não estiver em modo suporte
- [x] Adicionar logs de debug para diagnóstico
- [x] Testar assumir contexto de suporte
- [x] Testar sair do contexto de suporte
- [x] Verificar que módulos são carregados corretamente
- [x] Documentar solução

### Segunda Fase (Correções Adicionais - 2025-10-20)
- [x] Corrigir logout para limpar contexto de suporte
- [x] Corrigir interceptor 401 para limpar contexto de suporte
- [x] Adicionar tipos TypeScript para modo suporte (_support_mode)
- [x] Criar interface SupportModeUser para type safety
- [x] Remover componente duplicado SupportContext.vue

## 🎯 Benefícios da Correção

1. **✅ Modo Suporte Funcional**
   - SuperAdmin pode assumir contexto de qualquer autarquia
   - Vê todos os módulos daquela autarquia
   - Tem permissões de admin para fazer intervenções

2. **✅ Sem Requisições Desnecessárias**
   - Módulos vêm do contexto salvo no localStorage
   - Não faz chamadas à API enquanto em modo suporte
   - Performance melhorada

3. **✅ Isolamento de Contexto**
   - Dados originais do superadmin são preservados
   - Fácil voltar ao contexto original
   - Sem interferência entre contextos

4. **✅ Logs de Debug**
   - Fácil identificar se está em modo suporte: 🛡️
   - Fácil identificar modo normal: 👤
   - Quantidade de módulos carregados visível

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Módulos não aparecem após assumir contexto
**Causa:** Context não foi salvo no localStorage
**Solução:** Verificar console do backend para erros, verificar se backend retorna `modulos` no response

### Problema 2: Não consegue sair do modo suporte
**Causa:** Token de suporte expirado ou inválido
**Solução:** Limpar localStorage manualmente e fazer login novamente

### Problema 3: Aparece erro "Usuário não tem permissão"
**Causa:** Backend não reconhece o token de suporte
**Solução:** Verificar se o token de suporte está sendo enviado corretamente no header Authorization

## 🎉 Resultado Final

O **Modo Suporte** agora funciona perfeitamente:

✅ SuperAdmin pode assumir contexto de qualquer autarquia
✅ Vê TODOS os módulos daquela autarquia com permissões de admin
✅ Pode fazer intervenções e gerenciar dados como admin
✅ Pode sair facilmente e voltar ao seu contexto original
✅ Performance otimizada (usa dados do localStorage)
✅ Logs de debug claros para diagnóstico

**Status:** ✅ **MODO SUPORTE CORRIGIDO E FUNCIONAL**

---

## 🔧 Correções Adicionais - Fase 2 (2025-10-20)

Após análise detalhada do código, foram identificados e corrigidos problemas críticos de segurança e manutenibilidade:

### 1. ⚠️ CRÍTICO: Limpeza de Contexto no Logout

**Problema:** Quando o usuário fazia logout enquanto estava em modo suporte, os dados do contexto permaneciam no localStorage, podendo ser acessados por outro usuário.

**Arquivos Modificados:**
- `/frontend/src/services/auth.service.ts`

**Correções Aplicadas:**

```typescript
// ANTES - logout()
localStorage.removeItem('auth_token')
localStorage.removeItem('user_data')

// DEPOIS - logout()
localStorage.removeItem('auth_token')
localStorage.removeItem('user_data')
supportService.clearSupportContext() // ← Limpa support_context e original_user_data
```

```typescript
// ANTES - Interceptor 401
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
  window.location.href = '/login'
}

// DEPOIS - Interceptor 401
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
  supportService.clearSupportContext() // ← Limpa contexto de suporte também
  window.location.href = '/login'
}
```

**Impacto:** Previne vazamento de dados sensíveis e confusão de identidade entre sessões.

---

### 2. 🔒 Type Safety para Modo Suporte

**Problema:** A interface `User` não incluía a propriedade `_support_mode`, causando erros de tipo e falta de segurança em tempo de compilação.

**Arquivo Modificado:**
- `/frontend/src/types/auth.ts`

**Correções Aplicadas:**

```typescript
// Interface User atualizada
export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;
  autarquia_ativa_id: number;
  autarquia?: Autarquia;
  is_active: boolean;
  is_superadmin: boolean;
  _support_mode?: boolean; // ← NOVO
}

// Nova interface específica para modo suporte
export interface SupportModeUser extends User {
  _support_mode: true;
  role: 'admin';
  is_superadmin: false;
  autarquia: Autarquia; // Sempre presente em modo suporte
  autarquia_ativa_id: number;
}
```

**Benefícios:**
- TypeScript agora reconhece a propriedade `_support_mode`
- Tipo específico `SupportModeUser` garante consistência
- Melhor autocomplete e detecção de erros no editor

---

### 3. 🧹 Remoção de Código Duplicado

**Problema:** Dois componentes faziam essencialmente a mesma coisa:
- `/frontend/src/components/support/SupportContext.vue` (não usado)
- `/frontend/src/components/support/tabs/SupportContextTab.vue` (usado)

**Ação Tomada:**
- ✅ Removido `SupportContext.vue`
- ✅ Mantido `SupportContextTab.vue` que tem mais funcionalidades

**Benefício:** Reduz confusão e facilita manutenção futura.

---

## 📊 Resumo das Correções

| Correção | Severidade | Status |
|----------|-----------|--------|
| Limpeza de contexto no logout | 🔴 CRÍTICA | ✅ Corrigido |
| Limpeza de contexto no interceptor 401 | 🔴 CRÍTICA | ✅ Corrigido |
| Type safety (_support_mode) | 🟡 MÉDIA | ✅ Corrigido |
| Interface SupportModeUser | 🟡 MÉDIA | ✅ Corrigido |
| Componente duplicado | 🟢 BAIXA | ✅ Corrigido |

---

## 🧪 Testes Adicionais Recomendados

Após as correções da Fase 2, realizar os seguintes testes:

### Teste de Segurança: Logout em Modo Suporte
```
1. Login como SuperAdmin
2. Assumir contexto de uma autarquia
3. Verificar que modo suporte está ativo
4. Fazer logout
5. Verificar localStorage:
   ✅ auth_token: removido
   ✅ user_data: removido
   ✅ support_context: removido
   ✅ original_user_data: removido
```

### Teste de Segurança: Token Inválido em Modo Suporte
```
1. Login como SuperAdmin
2. Assumir contexto de uma autarquia
3. Invalidar token manualmente (backend ou editar localStorage)
4. Fazer qualquer requisição que resulte em 401
5. Verificar localStorage:
   ✅ Todos os dados limpos incluindo contexto de suporte
   ✅ Redirecionado para /login
```

### Teste de Type Safety
```
1. Abrir useModulos.ts no editor
2. Acessar user._support_mode
   ✅ TypeScript não mostra erro
   ✅ Autocomplete funciona
3. Tentar usar SupportModeUser em support.service.ts
   ✅ Tipo é reconhecido corretamente
```

---

**Status Final:** ✅ **MODO SUPORTE COMPLETAMENTE CORRIGIDO E SEGURO**

---

**Primeira Correção:** 2025-10-20 (Fase 1 - useModulos)
**Correções Adicionais:** 2025-10-20 (Fase 2 - Segurança e Type Safety)
**Total de Arquivos Modificados:** 4 (useModulos.ts, auth.service.ts, auth.ts, + 1 removido)
**Linhas Totais Modificadas:** ~60 linhas
**Backward Compatible:** Sim (não quebra funcionalidade existente)
