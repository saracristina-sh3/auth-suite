<template>
  <BaseLayout title="Meu Perfil" icon="pi-user">
    <div class="w-full max-w-4xl space-y-6">
      <h2 class="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
        Informações Pessoais
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-muted-foreground">Nome</label>
          <div class="p-3 bg-muted rounded-md border border-border text-foreground">
            {{ user?.name || '-' }}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-muted-foreground">Email</label>
          <div class="p-3 bg-muted rounded-md border border-border text-foreground">
            {{ user?.email || '-' }}
          </div>
        </div>

        <div class="flex flex-col gap-2" v-if="user?.autarquia">
          <label class="text-sm font-medium text-muted-foreground">Autarquia</label>
          <div class="p-3 bg-muted rounded-md border border-border flex items-center gap-2 text-foreground">
            <i class="pi pi-building text-primary"></i>
            {{ user.autarquia.nome }}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
          <div class="p-3 bg-muted rounded-md border border-border flex items-center gap-2 text-foreground">
            <i :class="['pi', user?.is_superadmin ? 'pi-shield text-copper-500' : 'pi-user text-primary']"></i>
            {{ user?.is_superadmin ? 'Super Administrador' : 'Usuário' }}
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-border">
        <p class="text-sm text-muted-foreground italic">
          Em breve você poderá editar suas informações de perfil.
        </p>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseLayout from '@/components/layouts/BaseLayout.vue'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/auth'

const user = ref<User | null>(null)

onMounted(() => {
  user.value = authService.getUserFromStorage()
})
</script>
