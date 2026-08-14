<script setup lang="ts">
import { ref } from 'vue'
import { useAccessGate } from '@/composables/useAccessGate'
import { ApiError } from '@/api/client'
import logo from '@/assets/images/MKBACBO_LOGO.png'

const { unlock } = useAccessGate()

const password = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

async function handleSubmit(): Promise<void> {
  if (submitting.value) return
  error.value = null
  submitting.value = true
  try {
    await unlock(password.value)
  } catch (err) {
    error.value =
      err instanceof ApiError && err.code === 'NETWORK_ERROR'
        ? 'No se pudo conectar con el servidor'
        : 'Contraseña incorrecta'
    password.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="access-gate">
    <form class="access-gate__card" @submit.prevent="handleSubmit">
      <img :src="logo" alt="MKBACBO" class="access-gate__logo" />
      <h1 class="access-gate__title">Acceso restringido</h1>
      <p class="access-gate__subtitle">Ingresa la contraseña para continuar</p>
      <input
        v-model="password"
        type="password"
        autocomplete="current-password"
        placeholder="Contraseña"
        class="access-gate__input"
        autofocus
        :disabled="submitting"
      />
      <button type="submit" class="access-gate__submit" :disabled="submitting">
        {{ submitting ? 'Verificando…' : 'Entrar' }}
      </button>
      <p v-if="error" class="access-gate__error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.access-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: var(--color-bg);
  padding: 1rem;
}

.access-gate__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 22rem;
  padding: 2rem 1.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
}

.access-gate__logo {
  width: 4.5rem;
  height: auto;
  margin-bottom: 0.5rem;
}

.access-gate__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.access-gate__subtitle {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0 0 0.5rem;
}

.access-gate__input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}

.access-gate__input:focus {
  outline: none;
  border-color: var(--color-waiting);
}

.access-gate__submit {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: var(--color-waiting);
  border: none;
  border-radius: 0.375rem;
  color: #000000;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
}

.access-gate__submit:hover {
  opacity: 0.9;
}

.access-gate__submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.access-gate__error {
  font-size: 0.8125rem;
  color: var(--color-loss);
  margin: 0;
}
</style>
