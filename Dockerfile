FROM php:8.4-apache

# Instala dependências do sistema, extensões PHP e configurações
RUN apt-get update && apt-get install -y \
    git \
    libpq-dev \
    libxml2-dev \
    locales \
    unzip \
    zip \
 && docker-php-ext-install pdo pdo_pgsql soap \

 # Configura o locale
 && echo "pt_BR.UTF-8 UTF-8" > /etc/locale.gen && locale-gen \
 && rm -rf /var/lib/apt/lists/*

# Define variáveis de ambiente de localização
ENV LANG=pt_BR.UTF-8 \
    LANGUAGE=pt_BR.UTF-8 \
    LC_ALL=pt_BR.UTF-8

# Instala o Composer globalmente
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copia configuração personalizada do Apache
COPY .docker/000-default.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite

EXPOSE 80