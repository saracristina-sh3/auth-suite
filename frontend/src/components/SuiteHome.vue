<script setup lang="ts">
import { useRouter } from 'vue-router'
import SuiteItems from './SuiteItems.vue'
import ComprasIcon from './icons/IconCompras.vue'
import AlmoxarifadoIcon from './icons/IconAlmoxarifado.vue'
import ContabilidadeIcon from './icons/IconContabilidade.vue'
import DepartamentoPessoalIcon from './icons/IconDepartamentoPessoal.vue'
import FrotaIcon from './icons/IconFrota.vue'

const router = useRouter()

const goToFrota = () => {
  console.log('Clicou em Frota')
  router.push('/frota')
}

const handleItemClick = (item: string) => {
  console.log('Clicou no item:', item)
  if (item === 'frota') {
    goToFrota()
  }
}
</script>

<template>
  <div class="suite-container">
    <div class="suite-grid">
      <SuiteItems @click="handleItemClick('frota')">
        <template #icon>
          <FrotaIcon />
        </template>
        <template #heading>Frota</template>
        Gerencie sua frota de veículos
      </SuiteItems>

      <SuiteItems @click="handleItemClick('compras')">
        <template #icon>
          <ComprasIcon />
        </template>
        <template #heading>Compras</template>
        Sistema de compras e licitações
      </SuiteItems>

      <SuiteItems @click="handleItemClick('almoxarifado')">
        <template #icon>
          <AlmoxarifadoIcon />
        </template>
        <template #heading>Almoxarifado</template>
        Controle de estoque e materiais
      </SuiteItems>

      <SuiteItems @click="handleItemClick('contabilidade')">
        <template #icon>
          <ContabilidadeIcon />
        </template>
        <template #heading>Contabilidade</template>
        Gestão contábil e fiscal
      </SuiteItems>

      <SuiteItems @click="handleItemClick('dp')">
        <template #icon>
          <DepartamentoPessoalIcon />
        </template>
        <template #heading>Departamento Pessoal</template>
        Gestão de recursos humanos
      </SuiteItems>
    </div>
  </div>
</template>

<style scoped>
.suite-container {
  padding: 2rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.suite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}

/* Responsividade */
@media (max-width: 768px) {
  .suite-container {
    padding: 1rem;
  }

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
