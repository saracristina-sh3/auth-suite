# 📋 Padrão de Respostas da API

> **Data de Implementação**: 26 de Outubro de 2025
> **Status**: Em implementação gradual

---

## 🎯 Objetivo

Padronizar todas as respostas da API para facilitar o tratamento no frontend e melhorar a consistência.

## 📐 Formato Padrão

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {...} | [...] | null
}
```

### Resposta de Sucesso com Paginação

```json
{
  "success": true,
  "message": "Lista recuperada com sucesso",
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

### Resposta de Erro

```json
{
  "success": false,
  "message": "Mensagem do erro"
}
```

### Resposta de Erro de Validação (422)

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": {
    "email": ["O campo email é obrigatório"],
    "cpf": ["O CPF informado é inválido"]
  }
}
```

---

## 🛠️ Trait `ApiResponses`

Localização: `app/Traits/ApiResponses.php`

### Métodos Disponíveis

#### Respostas de Sucesso

```php
// Sucesso genérico (200)
return $this->successResponse($data, 'Mensagem de sucesso');

// Sucesso com paginação (200)
return $this->successPaginatedResponse($paginator, 'Lista recuperada');

// Recurso criado (201)
return $this->createdResponse($data, 'Recurso criado');

// Recurso atualizado (200)
return $this->updatedResponse($data, 'Recurso atualizado');

// Recurso excluído (200)
return $this->deletedResponse('Recurso excluído');

// Sem conteúdo (204)
return $this->noContentResponse();
```

#### Respostas de Erro

```php
// Erro genérico (400)
return $this->errorResponse('Mensagem de erro', 400);

// Erro de validação (422)
return $this->validationErrorResponse($errors, 'Erro de validação');

// Não encontrado (404)
return $this->notFoundResponse('Recurso não encontrado');

// Não autorizado (401)
return $this->unauthorizedResponse('Não autorizado');

// Proibido (403)
return $this->forbiddenResponse('Acesso negado');

// Erro do servidor (500)
return $this->serverErrorResponse('Erro interno');

// Conflito (409)
return $this->conflictResponse('Conflito de dados');
```

---

## 📝 Exemplos de Uso

### Antes (Sem Trait)

```php
public function index()
{
    $users = User::paginate(10);

    return response()->json([
        'success' => true,
        'message' => 'Lista de usuários recuperada',
        'items' => $users->items(),
        'meta' => [
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
        ]
    ]);
}
```

### Depois (Com Trait)

```php
use App\Traits\ApiResponses;

class UserController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $users = User::paginate(10);

        return $this->successPaginatedResponse(
            $users,
            'Lista de usuários recuperada com sucesso.'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([...]);
        $user = User::create($validated);

        return $this->createdResponse(
            $user,
            'Usuário criado com sucesso.'
        );
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([...]);
        $user->update($validated);

        return $this->updatedResponse(
            $user,
            'Usuário atualizado com sucesso.'
        );
    }

    public function destroy(User $user)
    {
        $user->delete();

        return $this->deletedResponse('Usuário excluído com sucesso.');
    }
}
```

---

## ⚠️ Compatibilidade com Frontend

### Mudança de `items` para `data`

**Situação Atual:**
```json
{
  "success": true,
  "items": [...],
  "meta": {...}
}
```

**Novo Padrão:**
```json
{
  "success": true,
  "data": [...],
  "meta": {...}
}
```

### Migração Gradual

1. **Fase 1**: Adicionar trait em todos os controllers (mantendo `items` temporariamente) - ⚠️ Em andamento
2. **Fase 2**: Atualizar frontend para usar `data` ao invés de `items` - ✅ Concluído
   - Atualizado `PaginatedResponse<T>` interface em `api.types.ts`
   - Atualizado `useDataLoader.ts` para usar `response.data`
   - Todos os services já usavam `response.data.data` corretamente
3. **Fase 3**: Remover uso de `items` nos controllers - ✅ Concluído para UserController

### Controllers a Atualizar

- [x] `UserController` - ✅ Totalmente implementado (trait + todos os métodos)
- [ ] `AuthController`
- [ ] `AutarquiaController`
- [ ] `ModuloController`
- [ ] `AutarquiaModuloController`
- [ ] `RoleController`
- [ ] `UsuarioModuloPermissaoController`
- [ ] `SessionController`
- [ ] `SupportController`

---

## 🎯 Benefícios

1. **Consistência**: Todas as respostas seguem o mesmo formato
2. **Manutenibilidade**: Mudanças futuras são feitas em um único lugar
3. **Documentação**: Código auto-documentado através dos métodos do trait
4. **Tipagem**: Reduz erros de digitação em nomes de campos
5. **Facilita Testes**: Formato previsível facilita assertions nos testes

---

## 📚 Referências

- Trait: `app/Traits/ApiResponses.php`
- Exemplo de uso: `app/Http/Controllers/Api/UserController.php`

---

**Última atualização**: 26/10/2025
