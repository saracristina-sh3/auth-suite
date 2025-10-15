FROM php:8.4-apache

# Create user with matching host UID/GID
ARG USER_ID=1000
ARG GROUP_ID=1000

# Instala dependências do sistema, extensões PHP e configurações
RUN apt-get update && apt-get install -y \
    git \
    libpq-dev \
    libxml2-dev \
    locales \
    unzip \
    zip \
    sudo \
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

# Create user with matching host UID/GID
RUN groupadd -g ${GROUP_ID} appuser && \
    useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser && \
    usermod -aG sudo appuser && \
    echo "appuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Configura o Apache para usar appuser (SUBSTITUI as linhas existentes)
RUN sed -i 's/^User.*/User appuser/' /etc/apache2/apache2.conf && \
    sed -i 's/^Group.*/Group appuser/' /etc/apache2/apache2.conf

# Verifica se a configuração foi aplicada
RUN cat /etc/apache2/apache2.conf | grep -i "^User\|^Group"

# --- CONFIGURAÇÃO DEFINITIVA DO APACHE - APENAS API ---
RUN rm -f /etc/apache2/sites-available/000-default.conf
RUN echo '<VirtualHost *:80>' > /etc/apache2/sites-available/000-default.conf
RUN echo '    ServerName localhost' >> /etc/apache2/sites-available/000-default.conf
RUN echo '    DocumentRoot /api/public' >> /etc/apache2/sites-available/000-default.conf
RUN echo '    <Directory /api/public>' >> /etc/apache2/sites-available/000-default.conf
RUN echo '        AllowOverride All' >> /etc/apache2/sites-available/000-default.conf
RUN echo '        Require all granted' >> /etc/apache2/sites-available/000-default.conf
RUN echo '        Options -Indexes +FollowSymLinks' >> /etc/apache2/sites-available/000-default.conf
RUN echo '    </Directory>' >> /etc/apache2/sites-available/000-default.conf
RUN echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/000-default.conf
RUN echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/000-default.conf
RUN echo '</VirtualHost>' >> /etc/apache2/sites-available/000-default.conf

# Habilita mod_rewrite
RUN a2enmod rewrite

# Cria os diretórios do Laravel com permissões corretas
RUN mkdir -p /api/storage /api/bootstrap/cache \
 && chown -R appuser:appuser /api \
 && chmod -R 775 /api/storage /api/bootstrap/cache

# Cria um script de inicialização que corrige permissões no RUNTIME
COPY .docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

RUN a2enmod rewrite headers

WORKDIR /api

EXPOSE 80

# Use o script de inicialização em vez do comando padrão
CMD ["/usr/local/bin/start.sh"]