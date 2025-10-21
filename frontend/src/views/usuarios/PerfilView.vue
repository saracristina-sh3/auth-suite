<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authService } from '@/services/auth.service'
import HeaderLayout from '@/components/layouts/HeaderLayout.vue'
import Sh3Card from '@/components/common/Sh3Card.vue'
import type { User } from '@/types/auth'

const user = ref<User | null>(null)

onMounted(() => {
  user.value = authService.getUserFromStorage()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <HeaderLayout
      title="Meu Perfil"
      icon="pi-user"
      :user="user || undefined"
      :show-notifications="false"
    />

    <div class="max-w-4xl mx-auto px-6 py-8">
      <Sh3Card class="shadow-md">
        <template #content>
          <div class="space-y-6">
            <!-- Informações Pessoais -->
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Informações Pessoais
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nome -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-600">Nome</label>
                  <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                    {{ user?.name || '-' }}
                  </div>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-600">Email</label>
                  <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                    {{ user?.email || '-' }}
                  </div>
                </div>

                <!-- Autarquia -->
                <div class="flex flex-col gap-2" v-if="user?.autarquia">
                  <label class="text-sm font-medium text-gray-600">Autarquia</label>
                  <div class="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-2">
                    <i class="pi pi-building text-primary"></i>
                    {{ user.autarquia.nome }}
                  </div>
                </div>

                <!-- Tipo de Usuário -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-gray-600">Tipo de Usuário</label>
                  <div class="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-2">
                    <i :class="['pi', user?.is_superadmin ? 'pi-shield text-orange-500' : 'pi-user text-primary']"></i>
                    {{ user?.is_superadmin ? 'Super Administrador' : 'Usuário' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Ações futuras -->
            <div class="pt-4 border-t">
              <p class="text-sm text-gray-500 italic">
                Em breve você poderá editar suas informações de perfil.
              </p>
            </div>
          </div>
        </template>
      </Sh3Card>
    </div>
  </div>
</template>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
