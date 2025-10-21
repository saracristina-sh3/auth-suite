<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Header -->
   <Sh3Header
    title="Gerenciamento do Sistema"
    icon="pi-building"
    :user="user"
    @notify="abrirNotificacoes"
  >
    <!-- Exemplo de personalização com slot -->
    <template #actions>
      <Sh3Button icon="pi pi-bell" variant="text" @click="abrirNotificacoes" />
      <Sh3Button icon="pi pi-cog" variant="text" @click="abrirConfiguracoes" />
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
    <footer class="text-center text-muted-foreground text-sm py-4 border-t border-border">
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
const abrirConfiguracoes = () => console.log('⚙️ Configurações abertas')
</script>