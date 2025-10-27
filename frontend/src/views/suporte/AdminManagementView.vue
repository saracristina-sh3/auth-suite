<template>
  <BaseLayout title="Administração do Suporte" icon="pi pi-shield">
    <div
      v-if="loading"
      class="fixed top-0 left-0 right-0 h-1 bg-border z-[9999]"
    >
      <div class="h-full bg-primary animate-loading-bar"></div>
    </div>

    <div class="contents min-h-screen w-full bg-background">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-foreground mb-1">Painel do suporte</h2>
        <p class="text-sm text-muted-foreground font-medium m-0">Área restrita - SH3 Suporte</p>
      </div>

      <div class="flex justify-end mb-4">
        <Sh3Button
          class="!px-3 !py-2 shadow-md flex items-center gap-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all duration-200"
          v-if="showNewButton"
          @click="onNew"
        >
          <i class="pi pi-plus"> {{ activeTabLabel }} </i>
        </Sh3Button>
      </div>

      <div class="flex gap-2 mb-4 border-b-2 border-border">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          custom
          v-slot="{ navigate, isActive }"
        >
          <button
            @click="navigate"
            :class="[
              'bg-transparent border-none px-5 py-3 font-medium cursor-pointer border-b-[3px] transition-all duration-200',
              isActive
                ? 'text-primary border-b-primary'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
            ]"
          >
            {{ tab.label }}
          </button>
        </router-link>
      </div>

      <div class="tabs-content">
        <UserManagementSection
          v-if="currentTabName === 'usuarios'"
          ref="userSectionRef"
          :users="users"
          :roles="roles"
          :autarquias="autarquias"
          :loading="loading"
          :error="usersError"
          @reload="loadUsers"
          @show-message="showMessage"
        />

        <AutarquiaManagementSection
          v-else-if="currentTabName === 'autarquias'"
          ref="autarquiaSectionRef"
          :autarquias="autarquias"
          :loading="loading"
          :error="autarquiasError"
          @reload="loadAutarquias"
          @show-message="showMessage"
        />

        <ModuloManagementSection
          v-else-if="currentTabName === 'modulos'"
          ref="moduloSectionRef"
          :loading="loading"
          :error="modulosError"
          @reload="loadModulos"
          @show-message="showMessage"
        />

        <router-view
          v-else
          :support-context="supportContext"
          :selected-autarquia-id="selectedAutarquiaId"
          :autarquias="autarquias"
          @assume-context="handleAssumeContext"
          @exit-context="exitContext"
          @update:selected-autarquia-id="selectedAutarquiaId = $event"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/common/useNotification';
import { useDataLoader } from '@/composables/common/useDataLoader';
import { useSupportContext } from '@/composables/support/useSupportContext';
import { useSupportTabs } from '@/composables/support/useSupportTabs';
import { useUserTableConfig } from '@/config/useUserTableConfig';
import { useAutarquiaTableConfig } from '@/config/useAutarquiaTableConfig';
import { useModuloTableConfig } from '@/config/useModuloTableConfig';
import BaseLayout from '@/components/layouts/BaseLayout.vue';
import Sh3Button from '@/components/common/Sh3Button.vue';
import UserManagementSection from './sections/UserManagementSection.vue';
import AutarquiaManagementSection from './sections/AutarquiaManagementSection.vue';
import ModuloManagementSection from './sections/ModuloManagementSection.vue';

const router = useRouter();

const userSectionRef = ref();
const autarquiaSectionRef = ref();
const moduloSectionRef = ref();

const { showMessage, message, messageClass } = useNotification();
const {
  loadUsers,
  loadAutarquias,
  loadModulos,
  loadRoles,
  users,
  autarquias,
  modulos,
  roles,
  loading,
  usersError,
  autarquiasError,
  modulosError
} = useDataLoader(showMessage);

const {
  supportContext,
  selectedAutarquiaId,
  handleAssumeContext,
  exitContext
} = useSupportContext(autarquias, showMessage, router);

const userConfig = useUserTableConfig(roles, autarquias);
const autarquiaConfig = useAutarquiaTableConfig();
const moduloConfig = useModuloTableConfig();

const {
  tabs,
  currentTabName,
  activeTabLabel,
  showNewButton
} = useSupportTabs({
  userFields: userConfig.fields,
  autarquiaFields: autarquiaConfig.fields,
  moduloFields: moduloConfig.fields,
  onTabChange: async (tabName) => {
    if (tabName === 'usuarios') {
      await loadUsers();
    } else if (tabName === 'autarquias') {
      await loadAutarquias();
    } else if (tabName === 'modulos') {
      await loadModulos();
    }
  }
});

function onNew() {
  const tabName = currentTabName.value;

  if (tabName === 'usuarios') {
    userSectionRef.value?.openNew();
  } else if (tabName === 'autarquias') {
    autarquiaSectionRef.value?.openNew();
  }
}

onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadAutarquias()
  ]);
});
</script>

<style scoped>
@keyframes loading-bar {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.animate-loading-bar {
  animation: loading-bar 1.5s ease-in-out infinite;
}
</style>
