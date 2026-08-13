<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <header class="header-status">
    <div class="header-status__left">
      <h1 class="header-status__title">Baccarat Dashboard</h1>
    </div>
    <div class="header-status__right">
      <div class="header-status__indicator">
        <span
          class="header-status__dot"
          :class="store.isRealTimeConnected ? 'header-status__dot--connected' : 'header-status__dot--disconnected'"
        ></span>
        <span class="header-status__label">
          {{ store.isRealTimeConnected ? 'Real Time' : 'Desconectado' }}
        </span>
      </div>
      <span class="header-status__time">{{ store.summary.activeTimeFormatted }}</span>
    </div>
  </header>
</template>

<style scoped>
.header-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--color-surface-dark);
  border-bottom: 1px solid var(--color-border);
}

.header-status__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-status__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-status__indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.header-status__dot--connected {
  background: var(--color-win);
  box-shadow: 0 0 6px var(--color-win);
  animation: pulse 2s infinite;
}

.header-status__dot--disconnected {
  background: var(--color-loss);
}

.header-status__label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.header-status__time {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: monospace;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
