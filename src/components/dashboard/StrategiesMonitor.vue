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
  border-radius: 0.5rem;
  padding: 1rem;
}

.strategies-monitor__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  margin: 0 0 0.75rem;
}

.strategies-monitor__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strategies-monitor__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.625rem;
  border-radius: 0.375rem;
  background: var(--color-bg);
}

.strategies-monitor__item--inactive {
  opacity: 0.5;
}

.strategies-monitor__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.strategies-monitor__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.strategies-monitor__dot--active {
  background: var(--color-win);
}

.strategies-monitor__dot--inactive {
  background: var(--color-text-muted);
}

.strategies-monitor__name {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.strategies-monitor__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.strategies-monitor__score {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ep);
  font-family: monospace;
}

.strategies-monitor__toggle {
  background: var(--color-border);
  border: none;
  color: var(--color-text-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.strategies-monitor__toggle:hover {
  background: var(--color-bg);
}
</style>
