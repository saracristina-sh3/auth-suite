<template>
  <div class="suite-container">
    <!-- User Info -->
    <div class="user-info">
      <UsuarioCard />
    </div>

    <!-- Autarquia Info -->
    <div class="autarquia-info" v-if="currentUser">
      <Card class="autarquia-card">
        <template #content>
          <div class="flex align-items-center gap-3">
            <i class="pi pi-building text-2xl text-primary"></i>
            <div>
              <p class="text-sm text-color-secondary m-0">Autarquia</p>
              <p class="text-lg font-semibold m-0">{{ currentUser.autarquia?.nome || 'Não definida' }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p class="text-color-secondary mt-3">Carregando módulos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Message severity="error" :closable="false">
        {{ error }}
      </Message>
      <Button label="Tentar novamente" icon="pi pi-refresh" @click="reload" class="mt-3" />
    </div>

    <!-- Empty State -->
    <div v-else-if="modulos.length === 0" class="empty-container">
      <i class="pi pi-box text-6xl text-color-secondary mb-3"></i>
      <h3 class="text-xl font-semibold text-color-secondary">Nenhum módulo disponível</h3>
      <p class="text-color-secondary">
        Sua autarquia ainda não possui módulos liberados.<br />
        Entre em contato com o administrador do sistema.
      </p>
    </div>

    <!-- Modules Grid -->
    <div v-else class="grid gap-3 md:gap-4 mt-6 w-full max-w-6xl">
      <Card
        v-for="modulo in modulos"
        :key="modulo.key"
        class="cursor-pointer transition-all duration-300 hover:shadow-2xl border-1 surface-border"
        @click="handleItemClick(modulo.route)"
      >
        <template #content>
          <div class="flex flex-column align-items-center gap-3 text-center p-3">
            <div class="text-primary text-4xl">
              <component v-if="typeof modulo.icon !== 'string'" :is="modulo.icon" />
              <i v-else :class="modulo.icon"></i>
            </div>
            <h3 class="text-lg font-semibold m-0">{{ modulo.title }}</h3>
            <p class="text-color-secondary line-height-3 m-0">{{ modulo.description }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModulos } from '@/composables/useModulos'
import { authService } from '@/services/auth.service'
import UsuarioCard from './usuario/UsuarioCard.vue'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'
import type { User } from '@/types/auth'

const { modulos, loading, error, reload } = useModulos()
const router = useRouter()
const currentUser = ref<User | null>(null)

onMounted(() => {
  currentUser.value = authService.getUserFromStorage()
})

const handleItemClick = (route?: string) => {
  if (route) {
    router.push(route)
  }
}
</script>

<style scoped>
.suite-container {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90vh;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.autarquia-info {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 500px;
}

.autarquia-card {
  border: 2px solid var(--primary-color);
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.error-container {
  max-width: 500px;
}

.empty-container {
  padding: 4rem 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

@media (max-width: 768px) {
  .suite-container {
    padding: 1rem 0.5rem;
  }

  .autarquia-info {
    max-width: 100%;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
