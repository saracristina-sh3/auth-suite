<template>
  <div class="usuario-card">
    <div class="avatar">
      <span>F</span>
    </div>
    <div class="greeting">
      <h2>Olá, <span class="username">Fernando</span>!</h2>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
