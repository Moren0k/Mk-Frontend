<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import { computed } from 'vue'

const store = useDashboardStore()

const winRateColor = computed(() => {
  const rate = store.summary.winRatePercentage
  if (rate >= 70) return 'var(--color-win)'
  if (rate >= 50) return 'var(--color-waiting)'
  return 'var(--color-loss)'
})
</script>

<template>
  <section class="daily-summary" aria-label="Resumen del día">
    <h2 class="daily-summary__title">Resumen del Día</h2>
    <div class="daily-summary__grid">
      <div class="daily-summary__item">
        <span class="daily-summary__label">Tiempo activo</span>
        <span class="daily-summary__value">{{ store.summary.activeTimeFormatted }}</span>
      </div>
      <div class="daily-summary__item">
        <span class="daily-summary__label">Operaciones</span>
        <span class="daily-summary__value">{{ store.summary.closedOperations }}</span>
      </div>
      <div class="daily-summary__item">
        <span class="daily-summary__label">Wins</span>
        <span class="daily-summary__value daily-summary__value--win">{{ store.summary.wins }}</span>
      </div>
      <div class="daily-summary__item">
        <span class="daily-summary__label">Losses</span>
        <span class="daily-summary__value daily-summary__value--loss">{{ store.summary.losses }}</span>
      </div>
    </div>
    <div class="daily-summary__winrate">
      <span class="daily-summary__label">Win Rate</span>
      <span class="daily-summary__rate" :style="{ color: winRateColor }">
        {{ store.summary.winRatePercentage }}%
      </span>
    </div>
  </section>
</template>

<style scoped>
.daily-summary {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.daily-summary__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  margin: 0 0 0.75rem;
}

.daily-summary__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.daily-summary__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.daily-summary__label {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.daily-summary__value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.daily-summary__value--win {
  color: var(--color-win);
}

.daily-summary__value--loss {
  color: var(--color-loss);
}

.daily-summary__winrate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--color-border);
}

.daily-summary__rate {
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
