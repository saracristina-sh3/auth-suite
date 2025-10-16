<template>
  <div class="login-container">
    <!-- Lado esquerdo azul turquesa -->
    <div class="login-left">
      <div class="logo-section">
        <div class="logo-wrapper">
          <img src="@/assets/logo.svg" alt="Logo SH3" class="logo" />
        </div>
        <h1 class="system-name">SH3</h1>
        <p class="system-description">Sistema Integrado de Gestão</p>
      </div>

      <div class="links-section">
        <a href="#" class="link">site oficial</a>
        <a href="#" class="link">portal da transparência</a>
        <a href="#" class="link">webmail</a>
      </div>
    </div>

    <!-- Lado direito (formulário) -->
    <div class="login-right">
      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">Acesse sua conta</h2>
          <p class="form-subtitle">Entre com suas credenciais para continuar</p>
        </div>

        <form @submit.prevent="onLogin" class="login-form">
          <div class="input-group">
            <label class="input-label">Digite seu email</label>
            <input
              v-model="email"
              type="text"
              placeholder="example@email.com"
              class="input-field"
              required
            />
          </div>

          <div class="input-group">
            <label class="input-label">Senha</label>
            <input
              v-model="password"
              type="password"
              placeholder="Senha"
              class="input-field"
              required
            />
            <div class="forgot-password">
              <a href="#" class="forgot-link">Esqueci minha senha</a>
            </div>
          </div>

          <div class="checkbox-group">
            <input
              id="manterLogado"
              type="checkbox"
              v-model="keepLogged"
              class="checkbox"
            />
            <label for="manterLogado" class="checkbox-label">Manter logado</label>
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>

        <div class="form-footer">
          <a href="#" class="footer-link">Ajuda</a>
          <a href="#" class="footer-link">Política de privacidade</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'

const email = ref('')
const password = ref('')
const keepLogged = ref(false)
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

async function onLogin() {
  error.value = ''
  isLoading.value = true

  try {
    if (!email.value || !password.value) {
      error.value = 'Por favor, preencha todos os campos.'
      return
    }

    // Faz o login e recebe a resposta com o usuário
    const response = await authService.login({
      email: email.value,
      password: password.value
    })

    const user = response.user

    // Redireciona conforme o tipo de usuário
    if (user?.is_superadmin) {
      router.replace('/users')
    } else {
      router.replace('/')
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message || 'Falha ao autenticar. Tente novamente.'
    } else {
      error.value = 'Falha ao autenticar. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* (mantém todo o seu CSS original, está ótimo) */
</style>


<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: var(--color-background);
}

.login-left {
  flex: 1;
  background: var(--gradient-primary);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem;
  color: white;
  position: fixed;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    var(--vt-c-turquoise-dark) 0%,
    var(--vt-c-turquoise) 50%,
    var(--vt-c-turquoise-light) 100%);
  z-index: 1;
}

.login-left > * {
  position: relative;
  z-index: 2;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.logo-wrapper {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  width: 60px;
  height: 60px;
  filter: brightness(0) invert(1);
}

.system-name {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.system-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 450;
}

.links-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.link:hover {
  color: white;
  padding-left: 0.5rem;
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  padding: 2rem;
  margin-left: 50%; /* ✅ Adicionado para compensar o fixed do lado esquerdo */
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: var(--color-text);
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  color: var(--color-heading);
  font-size: 0.9rem;
}

.input-field {
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
}

.forgot-password {
  text-align: right;
  margin-top: 0.5rem;
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--color-primary);
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.checkbox-label {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.login-button {
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background: var(--color-primary-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.footer-link {
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    position: relative;
    padding: 2rem 1rem;
    min-height: 30vh;
  }

  .login-right {
    margin-left: 0;
    padding: 1.5rem;
  }

  .system-name {
    font-size: 2rem;
  }

  .logo-wrapper {
    width: 80px;
    height: 80px;
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .links-section {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .link {
    border-bottom: none;
    padding: 0.25rem 0.5rem;
  }

  .link:hover {
    padding-left: 0.5rem;
  }
}

@media (max-width: 480px) {
  .login-right {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
