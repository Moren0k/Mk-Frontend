<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import OutcomeBadge from '@/components/ui/OutcomeBadge.vue'

const store = useDashboardStore()
</script>

<template>
  <section class="last-winner" aria-label="Último ganador">
    <h2 class="last-winner__title">Último Ganador</h2>
    <div v-if="store.lastWinner" class="last-winner__body">
      <OutcomeBadge :outcome="store.lastWinner.outcome" size="lg" />
      <div class="last-winner__info">
        <span class="last-winner__outcome">{{ store.lastWinner.outcome }}</span>
        <span class="last-winner__round">Ronda {{ store.lastWinner.roundNumber }}</span>
        <span class="last-winner__score">
          {{ store.lastWinner.playerScore }} - {{ store.lastWinner.bankerScore }}
        </span>
      </div>
    </div>
    <div v-else class="last-winner__empty">
      <span>Sin resultados</span>
    </div>
  </section>
</template>

<style scoped>
.last-winner {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.last-winner__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  margin: 0 0 0.75rem;
}

.last-winner__body {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.last-winner__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.last-winner__outcome {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.last-winner__round {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.last-winner__score {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  font-family: monospace;
}

.last-winner__empty {
  padding: 1.25rem 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}
</style>
