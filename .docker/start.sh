#!/bin/bash

# Define as variáveis de ambiente do Apache
export APACHE_RUN_USER=appuser
export APACHE_RUN_GROUP=appuser

# Corrige permissões dos diretórios do Laravel
if [ -d "/api/storage" ]; then
    chown -R appuser:appuser /api/storage /api/bootstrap/cache
    chmod -R 775 /api/storage /api/bootstrap/cache
fi

# Corrige permissão do arquivo .env (CRÍTICO!)
if [ -f "/api/.env" ]; then
    chown appuser:appuser /api/.env
    chmod 644 /api/.env
fi

# Limpa o cache do Laravel
cd /api
sudo -u appuser php artisan config:clear
sudo -u appuser php artisan route:clear
sudo -u appuser php artisan cache:clear
sudo -u appuser php artisan view:clear

# Gera a APP_KEY se não existir (CRÍTICO!)
if ! grep -q "APP_KEY=base64:" /api/.env; then
    echo "🔑 Gerando APP_KEY..."
    sudo -u appuser php artisan key:generate
fi

# Recria o cache
sudo -u appuser php artisan config:cache
sudo -u appuser php artisan route:cache

# Inicia o Apache
exec apache2-foreground