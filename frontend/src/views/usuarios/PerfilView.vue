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
  <div class="min-h-screen bg-background">
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
              <h2 class="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
                Informações Pessoais
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nome -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-muted-foreground">Nome</label>
                  <div class="p-3 bg-muted rounded-md border border-border text-foreground">
                    {{ user?.name || '-' }}
                  </div>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-muted-foreground">Email</label>
                  <div class="p-3 bg-muted rounded-md border border-border text-foreground">
                    {{ user?.email || '-' }}
                  </div>
                </div>

                <!-- Autarquia -->
                <div class="flex flex-col gap-2" v-if="user?.autarquia">
                  <label class="text-sm font-medium text-muted-foreground">Autarquia</label>
                  <div class="p-3 bg-muted rounded-md border border-border flex items-center gap-2 text-foreground">
                    <i class="pi pi-building text-primary"></i>
                    {{ user.autarquia.nome }}
                  </div>
                </div>

                <!-- Tipo de Usuário -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                  <div class="p-3 bg-muted rounded-md border border-border flex items-center gap-2 text-foreground">
                    <i :class="['pi', user?.is_superadmin ? 'pi-shield text-copper-500' : 'pi-user text-primary']"></i>
                    {{ user?.is_superadmin ? 'Super Administrador' : 'Usuário' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Ações futuras -->
            <div class="pt-4 border-t border-border">
              <p class="text-sm text-muted-foreground italic">
                Em breve você poderá editar suas informações de perfil.
              </p>
            </div>
          </div>
        </template>
      </Sh3Card>
    </div>
  </div>
</template>
