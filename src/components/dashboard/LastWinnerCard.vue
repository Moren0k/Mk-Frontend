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
  border-radius: 8px;
  padding: 16px;
}

.last-winner__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
}

.last-winner__body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.last-winner__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.last-winner__outcome {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.last-winner__round {
  font-size: 12px;
  color: var(--color-text-muted);
}

.last-winner__score {
  font-size: 13px;
  color: var(--color-text-primary);
  font-family: monospace;
}

.last-winner__empty {
  padding: 20px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
