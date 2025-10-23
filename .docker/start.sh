#!/bin/bash
set -e

echo "🚀 Corrigindo permissões e iniciando PHP-FPM..."

# 🔧 Ajuste fino das permissões do Laravel
echo "🔧 Ajustando permissões do Laravel..."
find /api/storage /api/bootstrap/cache -type d -exec chmod 775 {} \;
find /api/storage /api/bootstrap/cache -type f -exec chmod 664 {} \;
chown -R appuser:appuser /api/storage /api/bootstrap/cache

# Corrige permissões básicas (garantia extra)
if [ -d "/api/storage" ]; then
    chown -R appuser:appuser /api/storage /api/bootstrap/cache
    chmod -R 775 /api/storage /api/bootstrap/cache
fi

# Corrige permissões do arquivo .env
if [ -f "/api/.env" ]; then
    chown appuser:appuser /api/.env
    chmod 644 /api/.env
fi

cd /api

# 🔄 Limpa caches antigos
sudo -u appuser php artisan config:clear || true
sudo -u appuser php artisan route:clear || true
sudo -u appuser php artisan cache:clear || true
sudo -u appuser php artisan view:clear || true

# 🔑 Gera APP_KEY se não existir
if ! grep -q "APP_KEY=base64:" /api/.env 2>/dev/null; then
    echo "🔑 Gerando APP_KEY..."
    sudo -u appuser php artisan key:generate
fi

# 🔒 Recria caches otimizados
sudo -u appuser php artisan config:cache || true
sudo -u appuser php artisan route:cache || true

echo "✅ Laravel pronto. Iniciando PHP-FPM..."
exec php-fpm
