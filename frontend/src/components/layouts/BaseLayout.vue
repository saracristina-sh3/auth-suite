<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <div class="flex items-center gap-3">
          <h1 class="font-semibold text-lg text-gray-700">Gerenciamento do Sistema</h1>
        </div>

        <div class="flex items-center gap-4">
          <Button 
            icon="pi pi-bell" 
            text 
            rounded 
            aria-label="Notificações" 
          />
          <div class="flex items-center gap-2 cursor-pointer select-none">
            <Avatar 
              :label="userInitials" 
              shape="circle" 
              size="large" 
              class="bg-primary text-white" 
            />
            <div class="flex flex-col">
              <span class="font-medium">{{ user?.name }}</span>
              <small class="text-gray-500">{{ user?.email }}</small>
            </div>
            <i class="pi pi-angle-down text-gray-500"></i>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center py-8 px-6">
      <Card class="w-full max-w-10xl">
        <template #content>
          <slot />
        </template>
      </Card>
    </main>

    <!-- Footer -->
    <footer class="text-center text-gray-400 text-sm py-4">
      v0.1.2023
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Card from 'primevue/card'

const user = JSON.parse(localStorage.getItem('user_data') || '{}')

const userInitials = computed(() => {
  if (!user?.name) return '?'
  return user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})
</script>