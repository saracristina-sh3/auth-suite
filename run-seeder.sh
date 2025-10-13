#!/bin/bash

# Script: run-seeder.sh
# Descrição: Script para executar seeders do Laravel em ambiente Docker

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis padrão -
ENVIRONMENT="${APP_ENV:-local}"
SEEDER_CLASS=""
FORCE=false
SERVICE="app"  
COMPOSE_FILE="docker-compose.yaml"

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 [OPÇÕES]"
    echo "Opções:"
    echo "  -e, --environment=ENV   Ambiente de execução (local, staging, prod). Padrão: local"
    echo "  -c, --class=CLASS       Classe específica do seeder a executar"
    echo "  -f, --force             Executar forçadamente (--force flag)"
    echo "  -s, --service=SERVICE   Serviço Docker onde executar (padrão: $SERVICE)"
    echo "  -h, --help              Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 --environment=local"
    echo "  $0 --class=UsersTableSeeder --force"
    echo "  $0 --environment=staging --class=ProductsTableSeeder"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift
            shift
            ;;
        --environment=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        -c|--class)
            SEEDER_CLASS="$2"
            shift
            shift
            ;;
        --class=*)
            SEEDER_CLASS="${1#*=}"
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -s|--service)
            SERVICE="$2"
            shift
            shift
            ;;
        --service=*)
            SERVICE="${1#*=}"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Opção desconhecida: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Verificar se o Docker Compose está disponível
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose não encontrado. Verifique a instalação.${NC}"
    exit 1
fi

# Verificar se o arquivo docker-compose.yml existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Arquivo $COMPOSE_FILE não encontrado!${NC}"
    echo "Diretório atual: $(pwd)"
    exit 1
fi

# Construir comando base
CMD="php artisan db:seed"

# Adicionar --force se solicitado
if [ "$FORCE" = true ]; then
    CMD="$CMD --force"
fi

# Adicionar classe específica se fornecida
if [ -n "$SEEDER_CLASS" ]; then
    CMD="$CMD --class=$SEEDER_CLASS"
fi

# Função para executar o seeder
run_seeder() {
    echo -e "${BLUE}Executando seeders no ambiente: ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "${BLUE}Comando: ${YELLOW}$CMD${NC}"
    echo -e "${BLUE}Serviço: ${YELLOW}$SERVICE${NC}"
    echo -e "${BLUE}Diretório: ${YELLOW}$(pwd)${NC}"
    echo ""
    
    # Verificar se o serviço está rodando
    if ! docker compose ps "$SERVICE" | grep -q "Up"; then
        echo -e "${RED}Serviço $SERVICE não está rodando!${NC}"
        echo "Serviços disponíveis:"
        docker compose ps --services
        return 1
    fi
    
    # Executar o comando no container
    if docker compose exec -T "$SERVICE" bash -c "$CMD"; then
        echo -e "${GREEN}✓ Seeders executados com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}✗ Falha ao executar seeders!${NC}"
        return 1
    fi
}

# Executar baseado no ambiente
case $ENVIRONMENT in
    local|development|dev)
        run_seeder
        ;;
    staging|test)
        echo -e "${YELLOW}Ambiente de staging detectado.${NC}"
        run_seeder
        ;;
    prod|production)
        run_seeder
        ;;
    *)
        echo -e "${RED}Ambiente '$ENVIRONMENT' não reconhecido!${NC}"
        echo "Use: local, staging ou prod"
        exit 1
        ;;
esac