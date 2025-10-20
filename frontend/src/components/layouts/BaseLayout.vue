<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
   <Sh3Header
    title="Gerenciamento do Sistema"
    icon="pi-building"
    :user="user"
    @notify="abrirNotificacoes"
    @userClick="abrirMenuUsuario"
  >
    <!-- Exemplo de personalização com slot -->
    <template #actions>
      <Sh3Button icon="pi pi-bell" text rounded @click="abrirNotificacoes" />
      <Sh3Button icon="pi pi-cog" text rounded @click="abrirConfiguracoes" />
    </template>
  </Sh3Header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center py-8 px-6">
      <Sh3Card class="w-full max-w-10xl">
        <template #content>
          <slot />
        </template>
      </Sh3Card>
    </main>

    <!-- Footer -->
    <footer class="text-center text-gray-400 text-sm py-4">
      v0.1.2023
    </footer>
  </div>
</template>

<script setup lang="ts">
import Sh3Button from '@/components/common/Sh3Button.vue'
import Sh3Card from '@/components/common/Sh3Card.vue'
import Sh3Header from '@/components/layouts/HeaderLayout.vue'

const user = JSON.parse(localStorage.getItem('user_data') || '{}')
const abrirNotificacoes = () => console.log('🔔 Notificações clicadas')
const abrirMenuUsuario = () => console.log('👤 Menu do usuário aberto')
const abrirConfiguracoes = () => console.log('⚙️ Configurações abertas')
</script>