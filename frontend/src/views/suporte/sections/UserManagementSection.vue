<template>
  <div class="user-management-section">
    <UserTab
      :users="users"
      :roles="roles"
      :autarquias="autarquias"
      :loading="loading"
      :error="error"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @retry="handleRetry"
    />

    <UserForm
      ref="userForm"
      :roles="roles"
      :autarquias="autarquias"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import UserTab from '@/views/suporte/sections/tabs/UserTab.vue';
import UserForm from '@/components/forms/UserForm.vue';
import { userService } from '@/services/user.service';
import { useUserTableConfig } from '@/config/useUserTableConfig';
import { useSaveUser } from '@/composables/support/useSaveUser';
import { useConfirmDialog } from '@/composables/common/useConfirmDialog';
import type { User } from '@/types/common/user.types';
import type { Role } from '@/services/role.service';
import type { Autarquia } from '@/types/support/autarquia.types';

const props = defineProps<{
  users: User[];
  roles: Role[];
  autarquias: Autarquia[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  'reload': [];
  'show-message': [type: 'success' | 'error', message: string];
}>();

const userForm = ref();

// Config (for table only)
const rolesRef = computed(() => props.roles);
const autarquiasRef = computed(() => props.autarquias);
const userConfig = useUserTableConfig(rolesRef, autarquiasRef);

const { saveUser } = useSaveUser({
  loadUsers: async () => emit('reload'),
  showMessage: (type, message) => emit('show-message', type, message)
});

const { confirmDeactivate, confirmActivate } = useConfirmDialog();

function openNew() {
  userForm.value?.open();
}

async function handleEdit(item: User) {
  try {
    const userAutarquias = await userService.getUserAutarquias(item.id);
    const autarquiaIds = userAutarquias.map(a => a.id);

    userForm.value?.open({
      ...item,
      autarquias: autarquiaIds
    });
  } catch (error) {
    console.error('Erro ao carregar autarquias do usuário:', error);
    userForm.value?.open(item);
  }
}

async function handleSave(data: any) {
  await saveUser(data);
}

async function handleToggleStatus(item: User): Promise<void> {
  const isActive = item.is_active;
  const itemName = item.name;

  const itemDetails: Record<string, string> = {
    'ID': item.id?.toString() || '',
    'Nome': itemName || '',
    'Email': item.email || '',
    'CPF': item.cpf || ''
  };

  const toggleAction = async () => {
    try {
      await userService.update(item.id, { is_active: !isActive });
      emit('reload');
      emit('show-message', 'success', `Usuário "${itemName}" ${!isActive ? 'ativado' : 'inativado'} com sucesso.`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      emit('show-message', 'error', 'Erro ao alterar status do usuário.');
    }
  };

  if (isActive) {
    await confirmDeactivate(itemName, toggleAction, itemDetails);
  } else {
    await confirmActivate(itemName, toggleAction, itemDetails);
  }
}

function handleRetry() {
  emit('reload');
}

defineExpose({
  openNew
});
</script>
