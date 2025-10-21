<template>
  <Sh3Modal v-model="isOpen" title="Módulos Liberados" :subtitle="autarquia?.nome" icon="pi-box">
    <div class="flex-1 overflow-y-auto">

      <Sh3LoadingState v-if="loading" message="Buscando informações...">
        <Sh3Button label="Cancelar" icon="pi pi-times" />
      </Sh3LoadingState>

      <Sh3ErrorState v-else-if="error" :message="error" buttonLabel="Tentar novamente" @retry="loadModulos" />

      <Sh3EmptyState v-else-if="modulos.length === 0" class="flex flex-col items-center justify-center py-12"
        icon="pi pi-box" iconClass="text-muted-foreground" title="Nenhum módulo liberado"
        description="Esta autarquia ainda não possui módulos liberados. Configure as liberações na tab 'Liberações'.">
        <Sh3Button label="Ir para Liberações" icon="pi pi-arrow-right" />
      </Sh3EmptyState>

      <div v-else class="space-y-6">

        <Sh3StatsGrid :stats="[
          {
            icon: 'pi pi-box',
            label: 'Total de módulos',
            value: stats.total,
            iconColor: 'text-primary'
          },
          {
            icon: 'pi pi-check-circle',
            label: 'Ativos',
            value: stats.ativos,
            iconColor: 'text-success'
          },
          {
            icon: 'pi pi-times-circle',
            label: 'Inativos',
            value: stats.inativos,
            iconColor: 'text-destructive'
          }
        ]" />

        <Sh3GridList :items="modulos.map(modulo => ({
          id: modulo.id,
          title: modulo.nome,
          description: modulo.descricao || 'Sem descrição disponível',
          icon: modulo.icone || 'box',
          iconGradient: 'bg-gradient-to-br from-selenium-600 to-selenium-800',
          status: modulo.pivot?.ativo ? 'Ativo' : 'Inativo',
          statusIcon: modulo.pivot?.ativo ? 'pi-check' : 'pi-times',
          statusClass: modulo.pivot?.ativo
            ? 'bg-jade-100 text-jade-800'
            : 'bg-ruby-100 text-ruby-800',
          details: [
            { label: 'Liberado em:', value: formatDate(modulo.pivot?.created_at) },
            modulo.pivot?.updated_at && modulo.pivot.updated_at !== modulo.pivot.created_at
              ? { label: 'Atualizado em:', value: formatDate(modulo.pivot?.updated_at) }
              : null,
            { label: 'Status Global:', value: modulo.ativo ? 'Módulo Ativo' : 'Módulo Inativo' }
          ].filter(Boolean) as { label: string; value: string }[]
        }))" />


        <div class="bg-selenium-50 border-l-4 border-selenium-500 p-4 rounded-r">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-selenium-600 text-lg mt-0.5"></i>
            <div>
              <p class="text-sm text-selenium-800 font-medium mb-1">
                Informação sobre liberações
              </p>
              <p class="text-sm text-selenium-700">
                Os módulos listados acima são os que foram
                <strong>liberados especificamente</strong> para esta autarquia.
                O status "Ativo/Inativo" refere-se à liberação específica, enquanto o
                "Status Global" indica se o módulo está ativo no sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="text-sm text-muted-foreground">
        <i class="pi pi-lightbulb text-sulfur-500 mr-2"></i>
        Gerencie as liberações na tab "Liberações"
      </div>
      <button @click="isOpen = false"
        class="px-4 py-2 bg-transparent border border-border text-foreground rounded-md hover:bg-accent transition-colors">
        Fechar
      </button>
    </template>
  </Sh3Modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Sh3Modal from "@/components/common/Sh3Modal.vue";
import Sh3LoadingState from "@/components/common/state/Sh3LoadingState.vue";
import Sh3EmptyState from "@/components/common/state/Sh3EmptyState.vue";
import Sh3ErrorState from "@/components/common/state/Sh3ErrorState.vue";
import Sh3StatsGrid from "@/components/common/Sh3StatsGrid.vue";
import Sh3GridList from "@/components/common/Sh3GridList.vue";
import Sh3Button from "@/components/common/Sh3Button.vue";
import { autarquiaService } from "@/services/autarquia.service";
import type { Modulo, Autarquia } from "@/types/auth";

defineExpose({ open, close });

const isOpen = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const modulos = ref<Modulo[]>([]);
const autarquia = ref<Autarquia | null>(null);

const stats = ref({
  total: 0,
  ativos: 0,
  inativos: 0
});

async function open(autarquiaData: Autarquia) {
  autarquia.value = autarquiaData;
  isOpen.value = true;
  await loadModulos();
}

function close() {
  isOpen.value = false;
  setTimeout(() => {
    modulos.value = [];
    autarquia.value = null;
    error.value = null;
  }, 300);
}

async function loadModulos() {
  if (!autarquia.value) return;
  loading.value = true;
  error.value = null;

  try {
    const [modulosData, statsData] = await Promise.all([
      autarquiaService.getModulos(autarquia.value.id),
      autarquiaService.getModulosStats(autarquia.value.id)
    ]);

    modulos.value = modulosData;
    stats.value = statsData;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erro ao carregar módulos da autarquia.";
  } finally {
    loading.value = false;
  }
}



function formatDate(date?: string): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
