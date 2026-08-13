<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import OutcomeBadge from '@/components/ui/OutcomeBadge.vue'

const store = useDashboardStore()
</script>

<template>
  <section class="games-grid" aria-label="Últimas 200 jugadas">
    <h2 class="games-grid__title">Últimas 200 Jugadas</h2>
    <div class="games-grid__container">
      <div class="games-grid__scroll">
        <OutcomeBadge
          v-for="game in [...store.last200Games].reverse()"
          :key="game.id"
          :outcome="game.outcome"
          size="sm"
          :title="`Ronda ${game.roundNumber}: ${game.outcome} (${game.playerScore}-${game.bankerScore})`"
          :aria-label="`Ronda ${game.roundNumber}, ${game.outcome}, ${game.playerScore} a ${game.bankerScore}`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.games-grid {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.games-grid__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
}

.games-grid__container {
  overflow-x: auto;
  padding-bottom: 4px;
}

.games-grid__scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: min-content;
}
</style>
