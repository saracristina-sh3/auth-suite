<template>
  <div class="min-h-screen flex flex-col bg-background">
    <Sh3Header
      :title="title"
      :icon="icon"
      :user="user"
      @notify="abrirNotificacoes"
    >
      <template #actions>
        <Sh3Button icon="pi pi-bell" variant="text" @click="abrirNotificacoes" />
        <Sh3Button icon="pi pi-cog" variant="text" @click="abrirConfiguracoes" />
      </template>
    </Sh3Header>

    <main class="flex-1 flex flex-col items-center py-8 px-6">
      <Sh3Card class="w-full max-w-10xl">
        <template #content>
          <slot />
        </template>
      </Sh3Card>
    </main>

    <footer class="text-center text-muted-foreground text-sm py-4 border-t border-border">
      v0.1.2023
    </footer>
  </div>
</template>

<script setup lang="ts">
import Sh3Button from '@/components/common/Sh3Button.vue'
import Sh3Card from '@/components/common/Sh3Card.vue'
import Sh3Header from '@/components/layouts/HeaderLayout.vue'
import { getItem, STORAGE_KEYS } from '@/utils/storage'
import type { User } from '@/types/common/user.types'

const props = defineProps<{
  title?: string
  icon?: string
}>()

const user = getItem<User | null>(STORAGE_KEYS.USER, null) || { name: 'Usuário', email: '' } as User
const abrirNotificacoes = () => console.log('🔔 Notificações clicadas')
const abrirConfiguracoes = () => console.log('⚙️ Configurações abertas')
</script>
