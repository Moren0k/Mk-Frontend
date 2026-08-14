<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import OutcomeBadge from '@/components/ui/OutcomeBadge.vue'

const store = useDashboardStore()
</script>

<template>
  <section class="streak-board" aria-label="Tablero de rachas">
    <h2 class="streak-board__title">Tablero de Rachas</h2>
    <div class="streak-board__container">
      <div class="streak-board__scroll">
        <div
          v-for="(streak, index) in store.streakBoard"
          :key="index"
          class="streak-board__entry"
        >
          <OutcomeBadge :outcome="streak.outcome" size="sm" />
          <span class="streak-board__count">x{{ streak.count }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.streak-board {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.streak-board__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  margin: 0 0 0.75rem;
}

.streak-board__container {
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.streak-board__scroll {
  display: flex;
  gap: 0.375rem;
  min-width: min-content;
}

.streak-board__entry {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: var(--color-bg);
  white-space: nowrap;
}

.streak-board__count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: monospace;
}
</style>
