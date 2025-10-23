FROM php:8.4-fpm

ARG USER_ID=1000
ARG GROUP_ID=1000

# Instala dependências e extensões
RUN apt-get update && apt-get install -y \
    git \
    libpq-dev \
    libxml2-dev \
    locales \
    unzip \
    zip \
    sudo \
 && docker-php-ext-install pdo pdo_pgsql soap \
 && echo "pt_BR.UTF-8 UTF-8" > /etc/locale.gen && locale-gen \
 && rm -rf /var/lib/apt/lists/*

# Define locale
ENV LANG=pt_BR.UTF-8 \
    LANGUAGE=pt_BR.UTF-8 \
    LC_ALL=pt_BR.UTF-8

# Instala o Composer globalmente
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Cria o usuário de aplicação (depois do Composer)
RUN groupadd -g ${GROUP_ID} appuser && \
    useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser && \
    usermod -aG sudo appuser && \
    echo "appuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Cria diretórios do Laravel com permissões corretas
RUN mkdir -p /api/storage /api/bootstrap/cache && \
    chown -R appuser:appuser /api && \
    chmod -R 775 /api/storage /api/bootstrap/cache

# Copia o script de inicialização
COPY .docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Define o usuário padrão (depois que ele existe)
USER appuser

WORKDIR /api

EXPOSE 9000

CMD ["/usr/local/bin/start.sh"]
