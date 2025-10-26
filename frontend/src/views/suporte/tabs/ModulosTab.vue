<template>
  <div @tab-change="$emit('tab-change', $event)">
    <Sh3Card>
      <template #title>
        <div class="flex align-items-center justify-content-between gap-6">
          <span>Módulos do Sistema</span>
          <Sh3Tag value="Somente Leitura" severity="info" />
        </div>
      </template>
      <template #subtitle>
        Os módulos são fixos e não podem ser criados ou removidos. Você
        pode ativar/desativar globalmente.
      </template>
      <template #content>
        <!-- loadingModulos State -->
        <Sh3LoadingState v-if="loadingModulos" class="w-full flex flex-col items-center justify-center py-8">
          <span class="text-muted-foreground mt-3">Carregando módulos...</span>
          <Sh3ProgressSpinner size="small" />
        </Sh3LoadingState>

        <!-- Error State -->
        <Sh3ErrorState v-else-if="error" :message="error" buttonLabel="Tentar novamente" @retry="carregarModulos" />

        <!-- Empty State -->
        <Sh3EmptyState v-else-if="modulos.length === 0" icon="pi pi-box" iconClass="text-muted-foreground"
          title="Nenhum módulo disponível"
          description="Não há módulos cadastrados no sistema.">
        </Sh3EmptyState>

        <!-- Modules Grid -->
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-4">
          <Sh3Card v-for="modulo in modulos" :key="modulo.id"
            class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">

            <!-- Header com ícone -->
            <template #header>
              <div class="flex items-center justify-center p-4">
                <div class="text-primary text-3xl">
                  <component v-if="typeof modulo.icon !== 'string'" :is="modulo.icon" />
                  <i v-else :class="modulo.icon"></i>
                </div>
              </div>
            </template>

            <!-- Título -->
            <template #title>
              <h3 class="text-base font-semibold text-foreground line-clamp-2 leading-tight text-center">
                {{ modulo.nome }}
              </h3>
            </template>

            <!-- Subtítulo/Descrição -->
            <template #subtitle>
              <p class="text-muted-foreground text-sm leading-relaxed line-clamp-3 text-center">
                {{ modulo.descricao }}
              </p>
            </template>

            <!-- Footer com Status -->
            <template #footer>
              <div class="flex align-items-center justify-content-between mt-3 gap-6">
                <span class="text-sm text-muted-foreground">Status:</span>
                <Sh3ToggleSwitch 
                  :model-value="modulo.ativo" 
                  @update:model-value="handleToggleStatus(modulo, $event)" 
                />
              </div>
            </template>
          </Sh3Card>
        </div>
      </template>
    </Sh3Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Sh3Card from "@/components/common/Sh3Card.vue";
import Sh3ToggleSwitch from "@/components/common/Sh3ToggleSwitch.vue";
import Sh3Tag from "@/components/common/Sh3Tag.vue";
import Sh3ProgressSpinner from "@/components/common/Sh3ProgressSpinner.vue";
import Sh3LoadingState from "@/components/common/state/Sh3LoadingState.vue";
import Sh3EmptyState from "@/components/common/state/Sh3EmptyState.vue";
import Sh3ErrorState from "@/components/common/state/Sh3ErrorState.vue";
import { moduloService } from '@/services/modulos.service'
import type { Modulo } from "@/types/support/modulos.types";
import { useModulosSupport } from '@/composables/support/useModulosSupport';

const { modulos, loadingModulos, error } = useModulosSupport()

const emit = defineEmits<{
  'tab-change': [event: any];
  'toggle-status': [modulo: Modulo];
  'toggle-modulo-status': [modulo: Modulo];
}>();

// Função para carregar todos os módulos (sem filtrar por autarquia)
const carregarModulos = async () => {
  loadingModulos.value = true
  error.value = null
  
  try {
    // Usar o serviço diretamente para pegar todos os módulos
    const response = await moduloService.getModulos()
    modulos.value = response
    
    console.log('Todos os módulos carregados:', modulos.value)
  } catch (err) {
    console.error('Erro ao carregar módulos:', err)
    error.value = 'Erro ao carregar módulos. Tente novamente.'
  } finally {
    loadingModulos.value = false
  }
}

// Função para lidar com a mudança de status
const handleToggleStatus = (modulo: Modulo, novoStatus: boolean) => {
  // Criar um objeto com o status atualizado
  const moduloAtualizado = { ...modulo, ativo: novoStatus }
  // Emitir evento para toggle-status (que vai mostrar o dialog de confirmação)
  emit('toggle-status', moduloAtualizado)
}

// Carregar módulos quando o componente for montado
onMounted(() => {
  carregarModulos()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>