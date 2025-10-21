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
            @click="toggleUserMenu"
            ref="userMenuButton"
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

          <!-- Menu do usuário -->
          <Menu
            ref="userMenu"
            :model="userMenuItems"
            :popup="true"
          />
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sh3Button from '@/components/common/Sh3Button.vue'
import Menu from 'primevue/menu'
import { authService } from '@/services/auth.service'

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

const router = useRouter()
const userMenu = ref()
const userMenuButton = ref()

const userInitials = computed(() => {
  if (!props.user?.name) return '?'
  return props.user.name
    .split(' ')
    .map((n: any[]) => n[0])
    .join('')
    .toUpperCase()
})

const userMenuItems = ref([
  {
    label: 'Meu Perfil',
    icon: 'pi pi-user',
    command: () => {
      router.push('/perfil')
    }
  },
  {
    separator: true
  },
  {
    label: 'Sair',
    icon: 'pi pi-sign-out',
    command: () => {
      authService.logout()
      router.push('/login')
    }
  }
])

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}
</script>
