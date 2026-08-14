<script setup lang="ts">
import { RouterView } from 'vue-router'
import AccessGate from '@/components/AccessGate.vue'
import { useAccessGate } from '@/composables/useAccessGate'

const { isUnlocked, lock } = useAccessGate()
</script>

<template>
  <AccessGate v-if="!isUnlocked" />
  <template v-else>
    <button class="logout-button" type="button" title="Cerrar sesión" @click="lock">
      Cerrar sesión
    </button>
    <RouterView />
  </template>
</template>

<style scoped>
.logout-button {
  position: fixed;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 50;
  padding: 0.25rem 0.625rem;
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  cursor: pointer;
}

.logout-button:hover {
  color: var(--color-text-primary);
  border-color: var(--color-waiting);
}
</style>
