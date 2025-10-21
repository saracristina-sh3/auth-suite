# Auth Suite

Sistema de autenticação e gerenciamento multi-autarquia desenvolvido com Laravel 12 e Vue 3.

## Sobre o Projeto

Auth Suite é uma aplicação full-stack para gerenciamento de autenticação, usuários, autarquias e módulos. O sistema permite que múltiplas autarquias gerenciem seus usuários e módulos de forma independente, com suporte a diferentes perfis e permissões.

### Principais Funcionalidades

- **Autenticação JWT**: Sistema de login seguro com tokens JWT
- **Gerenciamento Multi-Autarquia**: Suporte para múltiplas autarquias com contextos isolados
- **Gestão de Usuários**: CRUD completo de usuários com associação a autarquias
- **Gestão de Módulos**: Controle de módulos disponíveis por autarquia
- **Modo Suporte**: Visualização e gerenciamento global para usuários administradores
- **Interface Moderna**: UI responsiva e elegante com PrimeVue e Tailwind CSS

## Tecnologias

### Backend
- **Laravel 12** - Framework PHP
- **PostgreSQL 17** - Banco de dados
- **JWT Auth** - Autenticação via tokens
- **Laravel Sanctum** - API authentication
- **Laravel Telescope** - Debug e monitoramento

### Frontend
- **Vue 3** - Framework JavaScript reativo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Vue Router** - Gerenciamento de rotas
- **Pinia** - State management
- **PrimeVue 4** - Biblioteca de componentes UI
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web para frontend

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20.19+ ou 22.12+ (para desenvolvimento local)
- PHP 8.2+ (para desenvolvimento local)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd auth-suite
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário. As principais variáveis:

```env
APP_NAME="Auth Suite"
APP_ENV=local
APP_PORT=8000
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=auth-suite
DB_USERNAME=root
DB_PASSWORD=root
```

### 3. Suba os containers

```bash
docker-compose up -d
```

O Docker Compose irá:
1. Criar o banco de dados PostgreSQL
2. Instalar dependências do backend (Composer)
3. Executar migrations e seeders
4. Construir o frontend (npm build)
5. Iniciar os serviços

### 4. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Banco de dados**: localhost:5432

### Credenciais Padrão (após seeder)

Verifique os seeders em `backend/database/seeders` para as credenciais de teste.

## Desenvolvimento

### Backend

```bash
cd backend

# Instalar dependências
composer install

# Gerar chave da aplicação
php artisan key:generate

# Executar migrations
php artisan migrate

# Executar seeders
php artisan db:seed

# Iniciar servidor de desenvolvimento
php artisan serve
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes unitários
npm run test:unit

# Testes E2E
npm run test:e2e
```

## Estrutura do Projeto

```
auth-suite/
├── backend/              # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── frontend/             # Aplicação Vue 3
│   ├── src/
│   │   ├── assets/       # Estilos e recursos
│   │   │   ├── colors/   # Sistema de cores
│   │   │   └── styles/   # CSS customizado
│   │   ├── components/   # Componentes Vue
│   │   │   ├── common/   # Componentes reutilizáveis
│   │   │   └── ...
│   │   ├── router/       # Configuração de rotas
│   │   ├── services/     # Serviços API
│   │   ├── stores/       # Pinia stores
│   │   └── views/        # Páginas/views
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/                 # Documentação
├── .docker/             # Configurações Docker
├── docker-compose.yaml
└── Dockerfile
```

## Documentação

A documentação completa do projeto está disponível na pasta [`docs/`](docs/):

- [Análise da Aplicação](docs/Analise_aplicacao.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Guia de Cores](docs/COLOR_GUIDE.md)
- [Implementação Frontend](docs/FRONTEND_IMPLEMENTATION.md)
- [Modelagem do Banco de Dados](docs/MODELAGEM_BANCO_DADOS.md)
- [Implementação Multi-Autarquia](docs/MULTI_AUTARQUIA_IMPLEMENTATION.md)
- [Status da Implementação - Fase 1](docs/Status_Implementacao_Fase1.md)

## Sistema de Cores

O projeto utiliza um sistema de cores personalizado baseado na identidade visual SH3:

- **Selenium** (Azul) - Cor secundária
- **Copper** (Laranja) - Destaque
- **Jade** (Verde-azulado) - Cor primária, sucesso
- **Ruby** (Vermelho) - Erros, ações destrutivas
- **Sulfur** (Amarelo) - Avisos

Consulte o [Manual de Padronização de Cores](docs/MANUAL_PADRONIZACAO_CORES.md) para mais detalhes.

## Componentes Personalizados

O projeto inclui componentes Vue personalizados:

- **Sh3Message** - Componente de mensagens (info, success, error, warn)
- **Sh3Select** - Select com suporte a multi-seleção e busca
- **Sh3ToggleSwitch** - Switch toggle estilizado
- **Sh3Badge** - Badges para status e tags
- **Sh3Button** - Botões com variantes de estilo

Todos os componentes utilizam Tailwind CSS para estilização.

## Scripts Disponíveis

### Backend (Composer)

```bash
composer setup    # Instalação completa
composer dev      # Modo desenvolvimento (server + queue + logs + vite)
composer test     # Executar testes
```

### Frontend (NPM)

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run type-check   # Verificação de tipos TypeScript
npm run lint         # Lint e correção de código
npm run test:unit    # Testes unitários
npm run test:e2e     # Testes E2E com Cypress
```

## Docker

### Serviços

- **db**: PostgreSQL 17
- **build-backend**: Instalação de dependências e migrations
- **build-frontend**: Build do frontend Vue
- **app**: API Laravel (porta 8000)
- **frontend**: Nginx servindo o frontend (porta 3000)

### Comandos úteis

```bash
# Ver logs dos serviços
docker-compose logs -f

# Restartar um serviço específico
docker-compose restart app

# Executar comandos no container
docker-compose exec app php artisan migrate

# Parar todos os serviços
docker-compose down

# Rebuild dos containers
docker-compose up -d --build
```

## API Endpoints

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Dados do usuário autenticado

### Usuários

- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/{id}` - Detalhes do usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

### Autarquias

- `GET /api/autarquias` - Listar autarquias
- `POST /api/autarquias` - Criar autarquia
- `GET /api/autarquias/{id}` - Detalhes da autarquia
- `PUT /api/autarquias/{id}` - Atualizar autarquia
- `DELETE /api/autarquias/{id}` - Deletar autarquia

### Módulos

- `GET /api/modulos` - Listar módulos
- `POST /api/modulos` - Criar módulo
- `GET /api/modulos/{id}` - Detalhes do módulo
- `PUT /api/modulos/{id}` - Atualizar módulo
- `DELETE /api/modulos/{id}` - Deletar módulo

Consulte a [documentação completa da API](docs/API_ENDPOINTS.md) para mais detalhes.

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Backend**: Seguir PSR-12 e Laravel best practices
- **Frontend**: ESLint + TypeScript strict mode
- **Commits**: Mensagens descritivas em português

## Licença

Este projeto é proprietário e confidencial.

## Suporte

Para questões e suporte, consulte a documentação em [`docs/`](docs/) ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com Laravel e Vue.js**
