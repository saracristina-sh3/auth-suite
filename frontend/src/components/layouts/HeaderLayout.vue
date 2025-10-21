<template>
  <header class="background-grayscale shadow-sm sticky top-0 z-10 w-full border-b border-border">
    <div class="max-w-4xl mx-auto flex justify-between items-center px-6 py-3">
      <!-- Título e ícone -->
      <div class="flex items-center gap-3">
        <slot name="icon">
          <i v-if="icon" :class="['pi', icon, 'text-primary text-xl']"></i>
        </slot>
        <h1 class="font-semibold text-lg text-card-foreground truncate">
          <slot name="title">{{ title }}</slot>
        </h1>
      </div>

      <!-- Ações à direita -->
      <div class="flex items-center gap-4">
        <!-- Botão de notificações -->
        <slot name="actions">
          <Sh3Button
            v-if="showNotifications"
            icon="pi pi-bell"
            variant="text"
            aria-label="Notificações"
            @click="$emit('notify')"
          />
        </slot>

        <!-- Menu de usuário -->
        <slot name="user">
          <div
            v-if="user"
            class="relative flex items-center gap-2 select-none"
            ref="userMenuButton"
            v-click-outside="closeUserMenu"
          >
            <!-- Avatar + informações -->
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg px-2 py-1 transition-colors duration-150"
            >
              <Avatar
                :label="userInitials"
                shape="circle"
                size="large"
                class="bg-primary text-primary-foreground"
              />
              <div class="hidden sm:flex flex-col text-left">
                <span class="font-medium text-foreground leading-tight">{{ user.name }}</span>
                <small class="text-muted-foreground truncate max-w-[120px]">{{ user.email }}</small>
              </div>
              <i
                class="pi pi-angle-down text-muted-foreground transition-transform duration-200"
                :class="{ 'rotate-180': isUserMenuOpen }"
              ></i>
            </button>

            <!-- Dropdown -->
            <transition name="fade">
              <div
                v-if="isUserMenuOpen"
                class="absolute top-full right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border border-border py-1 z-20"
              >
                <button
                  @click="goToProfile"
                  class="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors duration-150"
                >
                  <i class="pi pi-user mr-3 text-muted-foreground"></i>
                  <span>Meu Perfil</span>
                </button>

                <div class="border-t border-border my-1"></div>

                <button
                  @click="logout"
                  class="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                >
                  <i class="pi pi-sign-out mr-3"></i>
                  <span>Sair</span>
                </button>
              </div>
            </transition>
          </div>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sh3Button from '@/components/common/Sh3Button.vue'
import { authService } from '@/services/auth.service'

const props = defineProps({
  title: { type: String, default: 'Título da Página' },
  icon: { type: String, default: null },
  showNotifications: { type: Boolean, default: true },
  user: { type: Object as () => { name: string; email: string } | null, default: null }
})

const emit = defineEmits(['notify'])

const router = useRouter()
const isUserMenuOpen = ref(false)
const userMenuButton = ref<HTMLElement>()

/** Gera iniciais do usuário */
const userInitials = computed(() => {
  const name = props.user?.name?.trim()
  if (!name) return '?'

  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''

  return (first + last).toUpperCase() || '?'
})

/** Ações do menu */
const toggleUserMenu = (event: Event) => {
  event.stopPropagation()
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const goToProfile = () => {
  closeUserMenu()
  router.push('/perfil')
}

const logout = async () => {
  closeUserMenu()
  await authService.logout()
  router.push('/login')
}

// Diretiva para detectar clique fora do componente
type ClickOutsideElement = HTMLElement & {
  clickOutsideEvent?: (event: Event) => void
}

const vClickOutside = {
  beforeMount(el: ClickOutsideElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      // Verifica se o clique foi fora do elemento
      if (!el.contains(event.target as Node)) {
        binding.value(event)
      }
    }
    // Usa capture phase para garantir que o evento seja processado antes
    document.addEventListener('click', el.clickOutsideEvent, true)
  },
  unmounted(el: ClickOutsideElement) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent, true)
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>