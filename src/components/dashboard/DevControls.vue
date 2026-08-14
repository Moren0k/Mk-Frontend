<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { OperationState } from '@/types/baccarat'

const store = useDashboardStore()
const isVisible = ref(false)
const isDev = import.meta.env.DEV

const OPERATION_STATES: OperationState[] = ['MG1', 'MG2', 'EP', 'WAITING', 'WIN', 'LOSS']
</script>

<template>
  <div v-if="isDev" class="dev-controls" :class="{ 'dev-controls--visible': isVisible }">
    <button class="dev-controls__toggle" @click="isVisible = !isVisible">
      {{ isVisible ? 'Ocultar DevControls' : 'DevControls' }}
    </button>
    <div v-if="isVisible" class="dev-controls__panel">
      <div class="dev-controls__group">
        <h3 class="dev-controls__group-title">Forzar Estado de Operación</h3>
        <div class="dev-controls__row">
          <button
            v-for="state in OPERATION_STATES"
            :key="state"
            @click="store.setOperationState(state)"
            class="dev-controls__btn"
            :class="{ 'dev-controls__btn--active': store.currentOperation.state === state }"
          >
            {{ state }}
          </button>
        </div>
      </div>
      <div class="dev-controls__group">
        <h3 class="dev-controls__group-title">Conexión</h3>
        <button
          @click="store.setRealTimeConnected(!store.isRealTimeConnected)"
          class="dev-controls__btn"
        >
          {{ store.isRealTimeConnected ? 'Desconectar' : 'Conectar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-controls {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-dev-border, #334155);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 16px 16px 0;
}

.dev-controls__toggle {
  background: transparent;
  border: 1px dashed var(--color-waiting);
  color: var(--color-waiting);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  width: 100%;
}

.dev-controls__toggle:hover {
  background: rgba(245, 158, 11, 0.1);
}

.dev-controls__panel {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dev-controls__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dev-controls__group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.dev-controls__row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.dev-controls__btn {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.dev-controls__btn:hover {
  background: var(--color-border);
}

.dev-controls__btn--active {
  border-color: var(--color-ep);
  color: var(--color-ep);
}

@media (max-width: 480px) {
  .dev-controls {
    margin: 12px 8px 0;
  }
}
</style>
