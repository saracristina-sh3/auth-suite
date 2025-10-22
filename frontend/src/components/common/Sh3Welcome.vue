<template>
  <div class="flex flex-col items-center mb-2">
    <Avatar
      :label="userInitials"
      shape="circle"
      size="large"
      class="bg-primary text-primary-foreground font-semibold !w-[70px] !h-[70px] !text-3xl"
    />
    <div class="mt-3 text-xl text-foreground">
      <h2>Olá, <span class="text-primary font-semibold">{{ user.name }}</span>!</h2>
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
