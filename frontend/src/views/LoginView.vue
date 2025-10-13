<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="onLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { login } from '@/services/auth.service';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

async function onLogin() {
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Falha ao autenticar.';
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 5rem auto;
  display: flex;
  flex-direction: column;
}
.error {
  color: red;
}
</style>
