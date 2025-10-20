<template>
  <header class="bg-white shadow-sm sticky top-0 z-10 w-full">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
      <!-- Título e ícone -->
      <div class="flex items-center gap-3">
        <slot name="icon">
          <i v-if="icon" :class="['pi', icon, 'text-primary text-xl']"></i>
        </slot>
        <h1 class="font-semibold text-lg text-gray-700">
          <slot name="title">{{ title }}</slot>
        </h1>
      </div>

      <!-- Ações à direita -->
      <div class="flex items-center gap-4">
        <!-- Slot de ações customizadas -->
        <slot name="actions">
          <Sh3Button 
            v-if="showNotifications"
            icon="pi pi-bell" 
            text 
            rounded 
            aria-label="Notificações" 
            @click="$emit('notify')"
          />
        </slot>

        <!-- Perfil do usuário -->
        <slot name="user">
          <div
            v-if="user"
            class="flex items-center gap-2 cursor-pointer select-none"
            @click="$emit('userClick')"
          >
            <Avatar 
              :label="userInitials" 
              shape="circle" 
              size="large" 
              class="bg-primary text-white" 
            />
            <div class="flex flex-col">
              <span class="font-medium">{{ user.name }}</span>
              <small class="text-gray-500">{{ user.email }}</small>
            </div>
            <i class="pi pi-angle-down text-gray-500"></i>
          </div>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sh3Button from '@/components/common/Sh3Button.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Título da Página'
  },
  icon: {
    type: String,
    default: null
  },
  showNotifications: {
    type: Boolean,
    default: true
  },
  user: {
    type: Object,
    default: null
  }
})


const userInitials = computed(() => {
  if (!props.user?.name) return '?'
  return props.user.name
    .split(' ')
    .map((n: any[]) => n[0])
    .join('')
    .toUpperCase()
})
</script>
