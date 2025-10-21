<template>
  <Sh3Modal
    v-model="isOpen"
    title="Módulos Liberados"
    :subtitle="autarquia?.nome"
    icon="pi-box"
  >
    <!-- Conteúdo principal -->
    <div class="flex-1 overflow-y-auto">
      <!-- Estado de carregamento -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <Sh3ProgressSpinner size="small" />
        <p class="text-muted-foreground mt-4">Carregando módulos...</p>
      </div>

      <!-- Estado de erro -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
        <i class="pi pi-exclamation-triangle text-destructive text-4xl mb-4"></i>
        <p class="text-destructive font-medium">{{ error }}</p>
        <button
          @click="loadModulos"
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="modulos.length === 0" class="flex flex-col items-center justify-center py-12">
        <i class="pi pi-box text-muted-foreground text-6xl mb-4"></i>
        <h3 class="text-lg font-semibold text-foreground mb-2">Nenhum módulo liberado</h3>
        <p class="text-muted-foreground text-center max-w-md">
          Esta autarquia ainda não possui módulos liberados. Configure as liberações na tab "Liberações".
        </p>
      </div>

      <!-- Conteúdo quando há módulos -->
      <div v-else class="space-y-6">
        <!-- Estatísticas -->
        <div class="bg-muted rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex items-center gap-3">
            <i class="pi pi-box text-primary text-xl"></i>
            <div>
              <p class="text-sm text-muted-foreground">Total de módulos</p>
              <p class="text-2xl font-bold text-foreground">{{ modulos.length }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i class="pi pi-check-circle text-success text-xl"></i>
            <div>
              <p class="text-sm text-muted-foreground">Ativos</p>
              <p class="text-2xl font-bold text-foreground">{{ activeModulosCount }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i class="pi pi-times-circle text-destructive text-xl"></i>
            <div>
              <p class="text-sm text-muted-foreground">Inativos</p>
              <p class="text-2xl font-bold text-foreground">{{ inactiveModulosCount }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de módulos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="modulo in modulos"
            :key="modulo.id"
            class="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1"
            @click="selectModulo(modulo)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg bg-gradient-to-br from-selenium-600 to-selenium-800 flex items-center justify-center"
                >
                  <i v-if="modulo.icone" :class="['pi', `pi-${modulo.icone}`, 'text-white text-xl']"></i>
                  <i v-else class="pi pi-box text-white text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-foreground text-base leading-tight">
                    {{ modulo.nome }}
                  </h3>
                </div>
              </div>

              <!-- Badge de status -->
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusBadgeClass(modulo.pivot?.ativo)"
              >
                <i
                  :class="['pi text-xs mr-1', modulo.pivot?.ativo ? 'pi-check' : 'pi-times']"
                ></i>
                {{ modulo.pivot?.ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>

            <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
              {{ modulo.descricao || "Sem descrição disponível" }}
            </p>

            <div class="space-y-2 pt-3 border-t border-border">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Liberado em:</span>
                <span class="text-foreground font-medium">{{ formatDate(modulo.pivot?.created_at) }}</span>
              </div>

              <div
                v-if="modulo.pivot?.updated_at && modulo.pivot.updated_at !== modulo.pivot.created_at"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-muted-foreground">Atualizado em:</span>
                <span class="text-foreground font-medium">{{ formatDate(modulo.pivot?.updated_at) }}</span>
              </div>

              <div class="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <span class="text-xs text-muted-foreground">Status Global:</span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="modulo.ativo ? 'bg-jade-100 text-jade-800' : 'bg-ruby-100 text-ruby-800'"
                >
                  {{ modulo.ativo ? "Módulo Ativo" : "Módulo Inativo" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nota informativa -->
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

    <!-- Rodapé customizado -->
    <template #footer>
      <div class="text-sm text-muted-foreground">
        <i class="pi pi-lightbulb text-sulfur-500 mr-2"></i>
        Gerencie as liberações na tab "Liberações"
      </div>
      <button
        @click="isOpen = false"
        class="px-4 py-2 bg-transparent border border-border text-foreground rounded-md hover:bg-accent transition-colors"
      >
        Fechar
      </button>
    </template>
  </Sh3Modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Sh3Modal from "@/components/common/Sh3Modal.vue";
import Sh3ProgressSpinner from "@/components/common/Sh3ProgressSpinner.vue";
import { autarquiaService } from "@/services/autarquia.service";
import type { Modulo } from "@/types/auth";

interface Autarquia {
  id: number;
  nome: string;
}

defineExpose({ open, close });

const isOpen = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const modulos = ref<Modulo[]>([]);
const autarquia = ref<Autarquia | null>(null);

const activeModulosCount = computed(() => modulos.value.filter(m => m.pivot?.ativo).length);
const inactiveModulosCount = computed(() => modulos.value.filter(m => !m.pivot?.ativo).length);

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
    const response = await autarquiaService.getModulos(autarquia.value.id);
    modulos.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erro ao carregar módulos da autarquia.";
  } finally {
    loading.value = false;
  }
}

function selectModulo(modulo: Modulo) {
  console.log("Módulo selecionado:", modulo);
}

function getStatusBadgeClass(ativo?: boolean): string {
  return ativo ? "bg-jade-100 text-jade-800" : "bg-ruby-100 text-ruby-800";
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
