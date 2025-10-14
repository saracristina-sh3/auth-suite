<script setup lang="ts">
import { useRouter } from 'vue-router'
import SuiteItems from './SuiteItems.vue'
import { useModulos } from '@/composables/useModulos'
import UsuarioCard from './usuario/UsuarioCard.vue'
import AutarquiaSelect from './select/AutarquiaSelect.vue'

const { modulos } = useModulos()
const router = useRouter()

const handleItemClick = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="suite-container">
    <div class="user-info">
      <UsuarioCard />
    </div>

    <div class="autarquia-select">
      <AutarquiaSelect />
    </div>

    <div class="suite-grid">
      <SuiteItems
        v-for="modulo in modulos"
        :key="modulo.key"
        @click="handleItemClick(modulo.route)"
      >
        <template #icon>
          <component :is="modulo.icon" />
        </template>
        <template #heading>{{ modulo.title }}</template>
        {{ modulo.description }}
      </SuiteItems>
    </div>
  </div>
</template>

<style scoped>
.suite-container {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background, #f9fafc);
  min-height: 90vh;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.autarquia-select {
  margin-top: 1rem;
}

.suite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 900px;
  width: 100%;
  margin-top: 2rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .suite-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .suite-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
