# TODO - Auth Suite - Melhorias e Implementações

> **Última atualização**: 26 de Outubro de 2025
> **Status**: Projeto em desenvolvimento ativo
> **Análise completa**: Ver `/tmp/analise_auth_suite.md`

---

## 🚨 PRIORIDADE CRÍTICA (Fazer AGORA)

### 1. Segurança e Tratamento de Erros

- [x] **Implementar Error Handler Centralizado** ✅ **CONCLUÍDO - 25/10/2025**
  - [x] Criar `src/utils/error-handler.ts` com função para extrair mensagens da API
  - [x] Processar erros de validação (422) com array de errors
  - [x] Processar erros de autenticação (401)
  - [x] Processar erros de autorização (403)
  - [x] Processar erros de servidor (500)
  - [x] Atualizar `error.utils.ts` para usar novo handler
  - [x] Refatorar composables principais para usar handler centralizado
  - **Arquivos refatorados**:
    - ✅ `error.utils.ts`
    - ✅ `useSaveHandler.ts`
    - ✅ `useDataLoader.ts`
    - ✅ `useUserAutarquias.ts`
    - ✅ `useSupportContext.ts`
  - **Arquivos pendentes**: services, views/components (ver `ERROR_HANDLER_MIGRATION.md`)
  - **Tempo gasto**: ~3 horas
  - **Documentação**: Ver `ERROR_HANDLER_MIGRATION.md`

- [x] **Implementar Refresh Token** ✅ **CONCLUÍDO - 25/10/2025**
  - [x] Backend: Criar endpoint `/auth/refresh`
  - [x] Backend: Retornar refresh_token no login
  - [x] Backend: Revogar refresh_token após uso (rotation)
  - [x] Frontend: Armazenar refresh_token separadamente
  - [x] Frontend: Interceptor 401 tenta refresh antes de logout
  - [x] Frontend: Fallback para login se refresh falhar
  - [x] Frontend: Fila de requisições pendentes durante refresh
  - [x] Frontend: Evitar loop infinito com flag `_retry`
  - **Arquivos**:
    - ✅ `backend/app/Http/Controllers/Api/AuthController.php`
    - ✅ `backend/routes/api.php`
    - ✅ `frontend/src/services/api.ts`
    - ✅ `frontend/src/services/auth.service.ts`
  - **Tempo gasto**: ~4 horas
  - **Documentação**: Ver `REFRESH_TOKEN_IMPLEMENTATION.md`
  - **Configuração atual**: Access token (1h), Refresh token (7 dias)

- [ ] **Migrar Token para HttpOnly Cookie (Opcional, Avançado)** ⚠️ **NÃO RECOMENDADO**
  - **Nota**: Tentativa realizada em 25/10/2025 resultou em 401 errors
  - **Status**: Revertido para localStorage
  - **Motivo**: Complexidade de configuração CORS e CSRF
  - **Decisão**: Manter abordagem atual com refresh token
  - **Tempo estimado**: 8-10 horas
  - **Recomendação**: Não implementar a menos que seja estritamente necessário

### 2. Validações de Input

- [x] **Adicionar Validações de CPF** ✅ **CONCLUÍDO - 26/10/2025**
  - [x] Frontend: Criar função `validateCPF()` em `src/utils/validators.ts`
  - [x] Frontend: Criar função `formatCPF()` em `src/utils/validators.ts`
  - [x] Frontend: Aplicar validação em `useUserTableConfig.ts`
  - [x] Frontend: Adicionar máscara `000.000.000-00`
  - [x] Backend: Criar regra customizada `CpfValidation.php`
  - [x] Backend: Aplicar validação em `UserController::store`
  - [x] Backend: Aplicar validação em `UserController::update`
  - [x] Backend: Limpar formatação antes de salvar no banco
  - **Arquivos**:
    - ✅ `frontend/src/utils/validators.ts`
    - ✅ `frontend/src/config/useUserTableConfig.ts`
    - ✅ `backend/app/Rules/CpfValidation.php`
    - ✅ `backend/app/Http/Controllers/Api/UserController.php`
  - **Tempo gasto**: ~2 horas
  - **Validações**: Verifica dígitos, rejeita CPFs inválidos (111.111.111-11, etc)

- [x] **Adicionar Validações de Email** ✅ **CONCLUÍDO - 26/10/2025**
  - [x] Frontend: Criar função `validateEmail()` robusta em `validators.ts`
  - [x] Frontend: Pattern regex aprimorado
  - [x] Frontend: Validações adicionais (pontos consecutivos, etc)
  - [x] Frontend: Aplicar validação em `useUserTableConfig.ts`
  - [x] Frontend: Feedback visual de email inválido
  - [x] Frontend: Placeholder descritivo
  - **Arquivos**:
    - ✅ `frontend/src/utils/validators.ts`
    - ✅ `frontend/src/config/useUserTableConfig.ts`
  - **Tempo gasto**: ~1 hora
  - **Validações**: Regex robusto, trim, rejeita pontos consecutivos, valida domínio

- [x] **Corrigir Incompatibilidade de Roles** ✅ **CONCLUÍDO - 26/10/2025**
  - [x] Alinhar roles do `RoleController` com `UserController`
  - [x] Adicionar role `clientAdmin` que estava faltando
  - [x] Corrigir `manager` → `gestor`
  - **Arquivo**: `backend/app/Http/Controllers/Api/RoleController.php`
  - **Roles disponíveis**: user, gestor, admin, superadmin, clientAdmin

- [x] **Corrigir Bug: data_liberacao NOT NULL Violation** ✅ **CONCLUÍDO - 26/10/2025**
  - [x] Corrigir `AutarquiaController::store` - linha 80
  - [x] Corrigir `AutarquiaModuloController::update` - linha 62
  - [x] Corrigir `AutarquiaModuloController::bulkUpdate` - linha 123
  - **Problema**: Coluna `data_liberacao` não aceita null, mas estava sendo inserido null
  - **Solução**: Usar `now()` em todas as operações de insert/update
  - **Arquivos**:
    - ✅ `backend/app/Http/Controllers/Api/AutarquiaController.php`
    - ✅ `backend/app/Http/Controllers/Api/AutarquiaModuloController.php`
  - **Tempo gasto**: ~30 minutos

- [x] **Adicionar Confirmação de Ações Destrutivas**
  - [x] Criar componente `ConfirmDialog.vue`
  - [x] Integrar em `Sh3Table.vue` antes de delete
  - [x] Adicionar confirmação em delete de usuários, autarquias, módulos
  - **Arquivos**: Novo componente + `Sh3Table.vue`
  - **Tempo estimado**: 3-4 horas

---

## 🎯 RESUMO DE IMPLEMENTAÇÕES RECENTES (25-26/10/2025)

### ✅ Concluído com Sucesso

1. **Error Handler Centralizado** (25/10/2025)
   - Sistema completo de tratamento de erros
   - Mensagens amigáveis para todos os status HTTP
   - Documentação completa em `ERROR_HANDLER_MIGRATION.md`

2. **Refresh Token System** (25/10/2025)
   - Renovação automática de tokens JWT
   - Token rotation para segurança
   - Sistema de fila para requisições simultâneas
   - Documentação completa em `REFRESH_TOKEN_IMPLEMENTATION.md`

3. **Validação de CPF** (26/10/2025)
   - Frontend: Validação com algoritmo completo
   - Frontend: Formatação automática com máscara
   - Backend: Regra customizada de validação
   - Rejeita CPFs inválidos conhecidos

4. **Validação de Email** (26/10/2025)
   - Regex robusto com múltiplas validações
   - Feedback visual inline
   - Validações adicionais (pontos, espaços, etc)

5. **Correções de Bugs**
   - Incompatibilidade de roles (manager vs gestor)
   - data_liberacao NOT NULL violation
   - Campo autarquia_preferida_id no formulário

### 📊 Progresso Geral
- **Segurança**: ✅ Error handler + ✅ Refresh token = Muito melhorado
- **Validações**: ✅ CPF + ✅ Email = Implementado
- **Bugs Críticos**: ✅ Todos corrigidos
- **Próxima Prioridade**: Testes e Confirmação de Ações Destrutivas

---

## 🔥 PRIORIDADE ALTA (Próxima Sprint - 1-2 semanas)

### 3. Padronizar Resposta da API

- [x] **Padronizar Formato de Resposta**
  - [x] Backend: Criar trait `ApiResponses` para padronizar respostas
  - [x] Backend: Aplicar em todos os controllers
  - [x] Decidir formato padrão:
    ```json
    {
      "success": boolean,
      "message": string,
      "data": T | T[] | null,
      "meta"?: { current_page, last_page, per_page, total },
      "errors"?: { field: [string] }
    }
    ```
  - [x] Frontend: Atualizar todos os services para novo padrão
  - **Arquivos**: Todos os controllers + todos os services
  - **Tempo estimado**: 8-12 horas
  - **Nota**: Mudança grande, fazer em branch separada

---

## 🔥 PRIORIDADE ALTA (Próxima Sprint - 1-2 semanas)

### 4. Testes

- [ ] **Implementar Testes Unitários - Services**
  - [ ] `auth.service.spec.ts` - Login, logout, getUser
  - [ ] `user.service.spec.ts` - CRUD completo
  - [ ] `autarquia.service.spec.ts` - List, create, update
  - [ ] `modulos.service.spec.ts` - List, create, update
  - [ ] `support.service.spec.ts` - assumeContext, exitContext
  - **Pasta**: `src/services/__tests__/`
  - **Tempo estimado**: 10-15 horas

- [ ] **Implementar Testes Unitários - Composables**
  - [ ] `useSaveHandler.spec.ts` - Lógica de save para cada entidade
  - [ ] `useModulos.spec.ts` - Carregamento e cache
  - [ ] `useSupportContext.spec.ts` - Assume e exit context
  - [ ] `useDataLoader.spec.ts` - Loading states
  - **Pasta**: `src/composables/__tests__/`
  - **Tempo estimado**: 8-12 horas

- [ ] **Implementar Testes E2E**
  - [ ] Configurar Cypress/Playwright
  - [ ] Teste: Fluxo de login
  - [ ] Teste: Criar usuário
  - [ ] Teste: Editar usuário
  - [ ] Teste: Modo suporte (assumir contexto)
  - [ ] Teste: Sair do modo suporte
  - [ ] Teste: Logout
  - **Pasta**: `cypress/e2e/` ou `e2e/`
  - **Tempo estimado**: 12-16 horas

- [ ] **Backend - Testes com PHPUnit**
  - [ ] Testes para `AuthController`
  - [ ] Testes para `UserController`
  - [ ] Testes para `AutarquiaController`
  - [ ] Testes para `ModuloController`
  - **Pasta**: `backend/tests/Feature/`
  - **Tempo estimado**: 12-18 horas

### 5. Refatoração de Composables

- [x] **Separar useSaveHandler**
  - [x] Criar `useSaveUser.ts` com lógica específica de usuário
  - [x] Criar `useSaveAutarquia.ts` com lógica específica de autarquia
  - [x] Criar `useSaveModulo.ts` com lógica específica de módulo
  - [x] Remover `useSaveHandler.ts`
  - [x] Atualizar `AdminManagementView.vue` para usar novos composables
  - **Arquivos**: Novos composables + `AdminManagementView.vue`
  - **Tempo estimado**: 4-6 horas

### 6. TypeScript - Remover `any` Types

- [ ] **Tipificar Services**
  - [ ] `autarquia-modulo.service.ts` linha 45: `erros: any[]` → `erros: string[]`
  - [ ] `permission.service.ts` linha 43: `params: any` → `params: PermissionQueryParams`
  - [ ] `support.service.ts` linha 118: `error: any` → `error: unknown`
  - **Tempo estimado**: 2-3 horas

- [ ] **Tipificar Composables**
  - [ ] `useSaveHandler.ts` linha 21: `data: any` → Union type específico
  - [ ] `useModulosSupport.ts`: Verificar e tipar
  - **Tempo estimado**: 2-3 horas

- [ ] **Tipificar Componentes**
  - [ ] `Sh3Form.vue` linha 124: `editingItem: Record<string, any>` → Generic type
  - [ ] `Sh3Select.vue`: `modelValue: any` → Generic type
  - [ ] `UserTab.vue`: Remover casts `as any`
  - **Tempo estimado**: 3-4 horas

- [ ] **Tipificar Tipos Compartilhados**
  - [ ] `table.types.ts` linha 28: `options?: any[]` → `options?: SelectOption[]`
  - [ ] Criar interface `SelectOption { label: string, value: any }`
  - **Tempo estimado**: 1-2 horas

- [ ] **Habilitar TypeScript Strict Mode**
  - [ ] Atualizar `tsconfig.json` com `"strict": true`
  - [ ] Corrigir todos os erros resultantes
  - **Tempo estimado**: 6-10 horas

### 7. UX - Loading States e Feedback

- [x] **Adicionar Loading States**
  - [x] `Sh3Table.vue`: Adicionar spinner durante carregamento
  - [x] `Sh3Form.vue`: Desabilitar botão submit durante salvamento
  - [x] `AdminManagementView.vue`: Loading indicator global
  - **Tempo estimado**: 3-4 horas

- [x] **Adicionar Estados Vazios Diferenciados**
  - [x] Usar `Sh3EmptyState.vue` em todas as tabelas
  - [x] Diferenciar: "Carregando", "Vazio", "Erro"
  - [x] Adicionar ilustrações ou ícones
  - **Tempo estimado**: 2-3 horas

- [ ] **Melhorar Mensagens de Erro**
  - [ ] Criar dicionário de mensagens amigáveis
  - [ ] Adicionar instruções de como resolver
  - [ ] Diferenciar cores: validação (amarelo), erro (vermelho), aviso (laranja)
  - **Tempo estimado**: 3-4 horas

---

## 📊 PRIORIDADE MÉDIA (Próximas 2-4 semanas)

### 8. Performance e Cache

- [x] **Implementar Cache de Módulos**
  - [x] `useModulos.ts`: Verificar se módulos já carregados antes de buscar API
  - [x] Adicionar TTL de 5 minutos
  - [x] Implementar invalidação manual
  - **Tempo estimado**: 3-4 horas

- [x] **Implementar Cache de Autarquias**
  - [x] Similar ao cache de módulos
  - [x] Cache no backend (Redis ou Laravel Cache)
  - **Tempo estimado**: 4-6 horas

- [x] **Otimizar Chamadas Paralelas**
  - [x] `AdminManagementView.vue`: Usar `Promise.all()` para carregar dados
  - [x] Evitar await sequencial desnecessário
  - **Tempo estimado**: 2 horas

- [x] **Implementar Paginação Server-side**
  - [x] Backend: Já tem paginação em users
  - [x] Frontend: Adicionar em autarquias e módulos
  - [x] `Sh3Table.vue`: Suportar paginação server-side
  - **Tempo estimado**: 6-8 horas

- [x] **Otimizar N+1 Queries (Backend)**
  - [x] Revisar todos os controllers
  - [x] Usar eager loading onde necessário
  - [x] Adicionar índices em migrations
  - **Tempo estimado**: 4-6 horas

### 9. Código Duplicado

- [ ] **Criar Função Utilitária para localStorage**
  - [ ] `src/utils/storage.ts`: `getItem()`, `setItem()`, `removeItem()`
  - [ ] Safe JSON parse/stringify
  - [ ] Substituir todos os usos diretos de localStorage
  - **Tempo estimado**: 3-4 horas

- [ ] **Centralizar Lógica de Token**
  - [ ] Backend: Trait `CreatesTokens`
  - [ ] Frontend: Service `token.service.ts`
  - **Tempo estimado**: 2-3 horas

### 10. Componentização

- [ ] **Dividir AdminManagementView.vue**
  - [ ] Criar `UserManagementSection.vue`
  - [ ] Criar `AutarquiaManagementSection.vue`
  - [ ] Criar `ModuloManagementSection.vue`
  - [ ] AdminManagementView se torna orquestrador
  - **Tempo estimado**: 6-8 horas

- [ ] **Refatorar Sh3Form.vue**
  - [ ] Dividir em formulários específicos
  - [ ] `UserForm.vue`, `AutarquiaForm.vue`, `ModuloForm.vue`
  - [ ] Adicionar validações inline
  - **Tempo estimado**: 8-10 horas

### 11. Documentação

- [ ] **Adicionar JSDoc em Services**
  - [ ] `user.service.ts`: Documentar todos os métodos
  - [ ] `autarquia.service.ts`: Documentar todos os métodos
  - [ ] `modulos.service.ts`: Documentar todos os métodos
  - [ ] Todos os outros services
  - **Tempo estimado**: 4-6 horas

- [ ] **Documentar Tipos Complexos**
  - [ ] `user.types.ts`: Explicar `autarquia_preferida_id` vs `autarquia_ativa_id`
  - [ ] `use-autarquia-pivot.types.ts`: Documentar pivot data
  - [ ] `support.types.ts`: Documentar SupportContext
  - **Tempo estimado**: 2-3 horas

- [ ] **Criar Guias de Desenvolvimento**
  - [ ] `docs/DEVELOPMENT.md`: Como adicionar novo service
  - [ ] `docs/COMPOSABLES.md`: Como criar novo composable
  - [ ] `docs/COMPONENTS.md`: Padrões de componentes
  - [ ] `docs/TESTING.md`: Como escrever testes
  - **Tempo estimado**: 6-8 horas

- [ ] **Criar Diagramas de Fluxo**
  - [ ] Fluxo de autenticação
  - [ ] Fluxo de modo suporte
  - [ ] Estrutura de dados de autarquias
  - [ ] Usar Mermaid ou Draw.io
  - **Tempo estimado**: 4-6 horas

- [ ] **README do Backend**
  - [ ] Estrutura de pastas
  - [ ] Controllers e Models
  - [ ] Migrations
  - [ ] Como executar testes
  - **Tempo estimado**: 2-3 horas

---

## 🎨 PRIORIDADE BAIXA (Backlog - Quando houver tempo)

### 12. Features Incompletas

- [ ] **Implementar Edição de Perfil**
  - [ ] `PerfilView.vue`: Adicionar formulário de edição
  - [ ] Backend: Endpoint `/profile/update`
  - [ ] Validações
  - [ ] Upload de avatar (opcional)
  - **Tempo estimado**: 6-8 horas

- [ ] **Implementar Recuperação de Senha**
  - [ ] Backend: Endpoint `/auth/forgot-password`
  - [ ] Backend: Endpoint `/auth/reset-password`
  - [ ] Frontend: View `ForgotPasswordView.vue`
  - [ ] Frontend: View `ResetPasswordView.vue`
  - [ ] Email com link de reset
  - **Tempo estimado**: 10-12 horas

- [ ] **Implementar Dashboard de Suporte**
  - [ ] `DashboardTab.vue`: Adicionar gráficos
  - [ ] Estatísticas de uso
  - [ ] Logs de ações
  - [ ] Usar Chart.js ou similar
  - **Tempo estimado**: 12-16 horas

- [ ] **Finalizar Links do Rodapé**
  - [ ] Criar páginas institucionais
  - [ ] Links funcionais
  - **Tempo estimado**: 4-6 horas

- [ ] **Implementar Theme Switcher**
  - [ ] Integrar `ThemeSwitcher.vue`
  - [ ] Persistir preferência
  - [ ] Temas: light, dark, auto
  - **Tempo estimado**: 3-4 horas

### 13. Melhorias de UX

- [ ] **Sincronização Entre Abas**
  - [ ] Usar `StorageEvent` para detectar mudanças em localStorage
  - [ ] Ou migrar para Pinia com persistência
  - [ ] Sincronizar autarquia ativa entre abas
  - **Tempo estimado**: 4-6 horas

- [ ] **Rate Limiting no Frontend**
  - [ ] Debounce em botões de submit
  - [ ] Throttle em requests de busca
  - [ ] Feedback visual
  - **Tempo estimado**: 2-3 horas

- [ ] **Sanitização de Mensagens de Erro**
  - [ ] Remover HTML de mensagens da API
  - [ ] Prevenir XSS via mensagens de erro
  - **Tempo estimado**: 1-2 horas

### 14. Melhorias de Segurança

- [ ] **Implementar CSRF Protection**
  - [ ] Backend: Middleware CSRF
  - [ ] Frontend: Incluir token CSRF em requests
  - **Tempo estimado**: 3-4 horas

- [ ] **Auditar Permissões no Frontend**
  - [ ] Router guards mais granulares
  - [ ] Verificar permissões específicas além de `is_superadmin`
  - **Tempo estimado**: 4-6 horas

---

## 📈 Métricas de Progresso

### Estatísticas do Projeto (Baseline)
- **Testes Unitários**: 0 / ~50 (0%)
- **Testes E2E**: 0 / ~10 (0%)
- **Tipos `any`**: ~15 ocorrências
- **Coverage**: 0%
- **Componentes Grandes**: 3 (AdminManagementView, Sh3Form, Sh3Table)
- **Composables com Múltiplas Responsabilidades**: 1 (useSaveHandler)

### Metas
- [ ] **90%+ de cobertura de testes**
- [ ] **0 tipos `any` no código de produção**
- [ ] **Componentes < 200 linhas**
- [ ] **Composables com responsabilidade única**
- [ ] **API 100% padronizada**
- [ ] **Documentação completa**

---

## 📝 Notas

- **Branch para trabalho**: Criar branches feature/... para cada item grande
- **Code Review**: Revisar pull requests antes de merge
- **Testes**: Executar testes antes de cada commit
- **Documentação**: Atualizar docs junto com código

---

## 🚀 Próximos Passos Imediatos

1. ✅ Corrigir erro de `can't access property "items"` (FEITO - 25/10/2025)
2. ✅ Corrigir erros de TypeScript (FEITO - 25/10/2025)
3. ✅ Implementar Error Handler Centralizado (FEITO - 25/10/2025)
4. ✅ Adicionar validações de CPF e Email (FEITO - 26/10/2025)
5. ✅ Implementar Refresh Token (FEITO - 25/10/2025)
6. ✅ Corrigir bugs de roles e data_liberacao (FEITO - 26/10/2025)
7. ⏳ **PRÓXIMO**: Adicionar Confirmação de Ações Destrutivas
8. ⏳ Implementar Testes Unitários
9. ⏳ Padronizar Respostas da API

---

## 📈 Estatísticas de Progresso

### Antes (24/10/2025)
- ❌ Sem error handler centralizado
- ❌ Tokens sem expiração/refresh
- ❌ Sem validações de CPF
- ❌ Validação de email básica
- ❌ 3 bugs críticos

### Depois (26/10/2025)
- ✅ Error handler completo com mensagens amigáveis
- ✅ Refresh token com rotation e fila
- ✅ Validação completa de CPF (frontend + backend)
- ✅ Validação robusta de email
- ✅ 0 bugs críticos conhecidos
- ✅ 3 documentações técnicas completas

### Tempo Total Investido
- **Error Handler**: ~3h
- **Refresh Token**: ~4h
- **Validações CPF/Email**: ~3h
- **Correções de bugs**: ~1h
- **Total**: ~11h de desenvolvimento focado

---

**Última revisão**: 26/10/2025
**Responsável**: Equipe de Desenvolvimento
**Documentos de referência**:
- `ERROR_HANDLER_MIGRATION.md`
- `REFRESH_TOKEN_IMPLEMENTATION.md`
- `/tmp/analise_auth_suite.md`
