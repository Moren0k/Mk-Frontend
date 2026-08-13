<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <section class="strategies-monitor" aria-label="Estrategias activas">
    <h2 class="strategies-monitor__title">Estrategias / Bots</h2>
    <ul class="strategies-monitor__list">
      <li
        v-for="strategy in store.strategies"
        :key="strategy.id"
        class="strategies-monitor__item"
        :class="{ 'strategies-monitor__item--inactive': !strategy.isBotActive }"
      >
        <div class="strategies-monitor__info">
          <span class="strategies-monitor__dot" :class="strategy.isBotActive ? 'strategies-monitor__dot--active' : 'strategies-monitor__dot--inactive'"></span>
          <span class="strategies-monitor__name">{{ strategy.name }}</span>
        </div>
        <div class="strategies-monitor__meta">
          <span class="strategies-monitor__score">{{ strategy.activeScore }}%</span>
          <button
            class="strategies-monitor__toggle"
            :aria-label="strategy.isBotActive ? `Desactivar ${strategy.name}` : `Activar ${strategy.name}`"
            @click="store.toggleBot(strategy.id)"
          >
            {{ strategy.isBotActive ? 'ON' : 'OFF' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.strategies-monitor {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.strategies-monitor__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
}

.strategies-monitor__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategies-monitor__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--color-bg);
}

.strategies-monitor__item--inactive {
  opacity: 0.5;
}

.strategies-monitor__info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategies-monitor__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.strategies-monitor__dot--active {
  background: var(--color-win);
}

.strategies-monitor__dot--inactive {
  background: var(--color-text-muted);
}

.strategies-monitor__name {
  font-size: 13px;
  color: var(--color-text-primary);
}

.strategies-monitor__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategies-monitor__score {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ep);
  font-family: monospace;
}

.strategies-monitor__toggle {
  background: var(--color-border);
  border: none;
  color: var(--color-text-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.strategies-monitor__toggle:hover {
  background: var(--color-bg);
}
</style>
