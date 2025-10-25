# Migração para Error Handler Centralizado

## Arquivos Já Refatorados ✅

### Composables
- ✅ `src/composables/common/useSaveHandler.ts`
- ✅ `src/composables/common/useDataLoader.ts`
- ✅ `src/composables/common/useUserAutarquias.ts`
- ✅ `src/composables/support/useSupportContext.ts`

### Utils
- ✅ `src/utils/error.utils.ts` - Agora exporta do error-handler.ts
- ✅ `src/utils/error-handler.ts` - Novo arquivo com handler centralizado

## Arquivos Pendentes de Refatoração 🔄

### Composables
- ⏳ `src/composables/common/useModulos.ts`
- ⏳ `src/composables/support/useModulosSupport.ts`
- ⏳ `src/composables/common/useNotification.ts`

### Services
- ⏳ `src/services/user.service.ts`
- ⏳ `src/services/support.service.ts`
- ⏳ `src/services/auth.service.ts`
- ⏳ `src/services/api.ts`

### Views/Components
- ⏳ `src/views/LoginView.vue`
- ⏳ `src/views/suporte/AdminManagementView.vue`
- ⏳ `src/views/suporte/tabs/DashboardTab.vue`
- ⏳ `src/views/suporte/tabs/ModulosTab.vue`
- ⏳ `src/views/suporte/tabs/LiberacoesTab.vue`
- ⏳ `src/views/suporte/tabs/autarquia/modal/AutarquiaUsersModal.vue`
- ⏳ `src/views/suporte/tabs/autarquia/modal/AutarquiaModulesModal.vue`
- ⏳ `src/components/SuiteHome.vue`

## Padrão de Migração

### ANTES
```typescript
import { getErrorMessage } from "@/utils/error.utils";

try {
  // código
} catch (error) {
  console.error("Erro:", error);
  showMessage("error", "Falha genérica.");
}
```

### DEPOIS
```typescript
import { handleApiError } from "@/utils/error-handler";

try {
  // código
} catch (error) {
  const { message, errors, type } = handleApiError(error);
  console.error("Erro:", error);

  // Para erros de validação, mostrar todos os erros
  if (type === 'validation' && errors) {
    const validationMessages = formatValidationErrors(errors);
    showMessage("error", validationMessages || message);
  } else {
    showMessage("error", message);
  }
}
```

## Benefícios da Migração

1. **Mensagens de Erro Mais Claras**
   - Extrai mensagens reais da API
   - Mostra erros de validação campo a campo
   - Diferencia tipos de erro (401, 403, 422, 500)

2. **Melhor Experiência do Usuário**
   - Mensagens amigáveis ao invés de "Erro inesperado"
   - Instruções específicas de como resolver
   - Feedback visual apropriado para cada tipo de erro

3. **Debugging Mais Fácil**
   - Logs mais informativos
   - Type safety com TypeScript
   - Estrutura consistente em toda aplicação

4. **Menor Código Duplicado**
   - Lógica de extração de erro centralizada
   - Fácil de manter e atualizar
   - Consistência garantida

## Próximos Passos

1. Refatorar composables restantes
2. Refatorar services
3. Refatorar views/components
4. Adicionar testes unitários para error-handler.ts
5. Atualizar documentação de desenvolvimento

## Exemplo Completo de Uso

### Erro de Validação (422)
```typescript
// API retorna:
{
  "message": "Erro de validação",
  "errors": {
    "email": ["Email já está em uso"],
    "cpf": ["CPF inválido"]
  }
}

// handleApiError extrai:
{
  message: "Email já está em uso",
  errors: { email: [...], cpf: [...] },
  type: "validation",
  status: 422
}

// formatValidationErrors formata:
"Email já está em uso\nCPF inválido"
```

### Erro de Autenticação (401)
```typescript
// API retorna:
{
  "message": "Token expirado"
}

// handleApiError extrai:
{
  message: "Token expirado",
  type: "authentication",
  status: 401
}
```

### Erro de Servidor (500)
```typescript
// handleApiError retorna:
{
  message: "Erro no servidor. Tente novamente em alguns instantes.",
  type: "server",
  status: 500
}
```

### Erro de Rede
```typescript
// handleApiError retorna:
{
  message: "Sem conexão com o servidor. Verifique sua internet.",
  type: "network"
}
```
