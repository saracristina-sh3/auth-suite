<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      @click.self="close"
    >
      <div
        class="bg-card text-card-foreground rounded-[var(--radius)] max-w-[90%] p-6 shadow-2xl"
        style="width: 600px"
      >
        <header class="flex justify-between items-center border-b border-border mb-4 pb-3">
          <h2 class="text-card-foreground text-xl font-semibold">
            {{ editingModulo ? 'Editar Módulo' : 'Novo Módulo' }}
          </h2>
          <button
            class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
            @click="close"
          >
            ×
          </button>
        </header>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nome -->
          <div class="field">
            <label for="nome" class="block font-medium mb-1 text-foreground">
              Nome <span class="text-destructive">*</span>
            </label>
            <input
              id="nome"
              v-model="formData.nome"
              type="text"
              required
              placeholder="Ex: Gestão de Frota"
              :class="[
                'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
                errors.nome ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
              ]"
              @blur="validateField('nome')"
              @input="clearError('nome')"
            />
            <span v-if="errors.nome" class="text-destructive text-sm mt-1">{{ errors.nome }}</span>
          </div>

          <div class="field">
            <label for="descricao" class="block font-medium mb-1 text-foreground">
              Descrição <span class="text-destructive">*</span>
            </label>
            <textarea
              id="descricao"
              v-model="formData.descricao"
              required
              rows="3"
              placeholder="Descreva a funcionalidade do módulo..."
              :class="[
                'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
                errors.descricao ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
              ]"
              @blur="validateField('descricao')"
              @input="clearError('descricao')"
            ></textarea>
            <span v-if="errors.descricao" class="text-destructive text-sm mt-1">{{ errors.descricao }}</span>
          </div>

          <div class="field">
            <label for="icone" class="block font-medium mb-1 text-foreground">
              Ícone (PrimeIcons) <span class="text-destructive">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="icone"
                v-model="formData.icone"
                type="text"
                required
                placeholder="Ex: pi pi-car"
                :class="[
                  'flex-1 border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
                  errors.icone ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
                ]"
                @blur="validateField('icone')"
                @input="clearError('icone')"
              />
              <div
                class="w-12 h-10 flex items-center justify-center border border-input rounded bg-background"
              >
                <i v-if="formData.icone" :class="formData.icone" class="text-xl text-primary"></i>
                <span v-else class="text-muted-foreground text-xs">?</span>
              </div>
            </div>
            <span v-if="errors.icone" class="text-destructive text-sm mt-1">{{ errors.icone }}</span>
            <span class="text-muted-foreground text-xs mt-1">
              Veja os ícones disponíveis em
              <a
                href="https://primevue.org/icons/"
                target="_blank"
                class="text-primary hover:underline"
              >
                PrimeIcons
              </a>
            </span>
          </div>

          <div class="field field-checkbox">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="formData.ativo"
                class="w-4 h-4"
              />
              <span class="text-foreground">Módulo Ativo</span>
            </label>
            <span class="text-muted-foreground text-xs ml-6">
              Módulos inativos não estarão disponíveis para autarquias
            </span>
          </div>

          <footer class="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              class="bg-transparent border border-border text-foreground px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-accent hover:border-border disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-primary text-primary-foreground border-none px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isSaving || !isFormValid"
            >
              <i v-if="isSaving" class="pi pi-spin pi-spinner text-sm"></i>
              <span>{{ isSaving ? 'Salvando...' : (editingModulo ? 'Atualizar' : 'Criar') }}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { Modulo } from '@/types/support/modulos.types';

// Emits
const emit = defineEmits<{
  save: [data: Partial<Modulo>];
}>();

// State
const isOpen = ref(false);
const editingModulo = ref<Modulo | null>(null);
const isSaving = ref(false);

// Form data
const formData = reactive({
  nome: '',
  descricao: '',
  icone: '',
  ativo: true
});

// Validation errors
const errors = reactive<Record<string, string>>({
  nome: '',
  descricao: '',
  icone: ''
});

// Validation rules
const validateField = (fieldName: keyof typeof formData) => {
  errors[fieldName] = '';

  switch (fieldName) {
    case 'nome':
      if (!formData.nome || formData.nome.trim().length < 3) {
        errors.nome = 'Nome deve ter pelo menos 3 caracteres';
      } else if (formData.nome.length > 50) {
        errors.nome = 'Nome não pode ter mais de 50 caracteres';
      }
      break;

    case 'descricao':
      if (!formData.descricao || formData.descricao.trim().length < 10) {
        errors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
      } else if (formData.descricao.length > 200) {
        errors.descricao = 'Descrição não pode ter mais de 200 caracteres';
      }
      break;

    case 'icone':
      if (!formData.icone || formData.icone.trim().length === 0) {
        errors.icone = 'Ícone é obrigatório';
      } else if (!formData.icone.startsWith('pi pi-')) {
        errors.icone = 'Ícone deve começar com "pi pi-"';
      }
      break;
  }
};

// Clear error for field
const clearError = (fieldName: string) => {
  errors[fieldName] = '';
};

// Check if form is valid
const isFormValid = computed(() => {
  // Check required fields
  if (!formData.nome || formData.nome.trim().length < 3) {
    return false;
  }

  if (!formData.descricao || formData.descricao.trim().length < 10) {
    return false;
  }

  if (!formData.icone || !formData.icone.startsWith('pi pi-')) {
    return false;
  }

  // Check if there are any errors
  return !Object.values(errors).some(error => error !== '');
});

// Open form
const open = (modulo?: Modulo) => {
  if (modulo) {
    editingModulo.value = modulo;
    formData.nome = modulo.nome || '';
    formData.descricao = modulo.descricao || '';
    formData.icone = modulo.icone || '';
    formData.ativo = modulo.ativo ?? true;
  } else {
    editingModulo.value = null;
    formData.nome = '';
    formData.descricao = '';
    formData.icone = 'pi pi-';
    formData.ativo = true;
  }

  // Clear all errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  isOpen.value = true;
};

// Close form
const close = () => {
  isOpen.value = false;
  editingModulo.value = null;
};

// Handle submit
const handleSubmit = async () => {
  // Validate all fields
  validateField('nome');
  validateField('descricao');
  validateField('icone');

  // Check if form is valid
  if (!isFormValid.value) {
    return;
  }

  try {
    isSaving.value = true;

    const data: any = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      icone: formData.icone.trim(),
      ativo: formData.ativo
    };

    // Include ID if editing
    if (editingModulo.value?.id) {
      data.id = editingModulo.value.id;
    }

    emit('save', data);

    // Wait a bit for the save to process
    await new Promise(resolve => setTimeout(resolve, 500));
    close();
  } finally {
    isSaving.value = false;
  }
};

// Expose methods
defineExpose({
  open,
  close
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.field {
  margin-bottom: 1rem;
}

.field-checkbox {
  margin-bottom: 0.5rem;
}
</style>
