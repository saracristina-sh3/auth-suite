<template>
  <div class="usuario-card">
    <Avatar 
              :label="userInitials" 
              shape="circle" 
              size="large" 
              class="bg-primary text-white" 
            />
    <div class="greeting">
      <h2>Olá, <span class="username">{{ user.name }}</span>!</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from 'primevue/avatar'
const user = JSON.parse(localStorage.getItem('user_data') || '{}')

const userInitials = computed(() => {
  if (!user?.name) return '?'
  return user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})
</script>

<style scoped>
.usuario-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.avatar {
  background-color: #2a8b8b;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.greeting {
  margin-top: 0.8rem;
  font-size: 1.2rem;
}

.username {
  color: var(--color-primary, #007ad9);
  font-weight: 600;
}
</style>
