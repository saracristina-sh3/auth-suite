#!/bin/sh
set -e

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="$SSL_DIR/selfsigned.crt"
KEY_FILE="$SSL_DIR/selfsigned.key"

echo "🔍 Verificando certificados SSL..."

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "🔐 Nenhum certificado encontrado. Gerando certificado autoassinado..."
  mkdir -p "$SSL_DIR"

  # Instala o OpenSSL se necessário
  if ! command -v openssl >/dev/null 2>&1; then
    echo "📦 Instalando OpenSSL..."
    apk add --no-cache openssl
  fi

  openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=SH3/OU=Dev/CN=localhost"

  echo "✅ Certificado gerado com sucesso!"
else
  echo "✅ Certificados já existem. Pulando geração."
fi

echo "🚀 Iniciando Nginx com HTTPS..."
exec nginx -g "daemon off;"
