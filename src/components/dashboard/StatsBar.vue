<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import { computed } from 'vue'

const store = useDashboardStore()

function formatPercent(value: number): string {
  return `${value}%`
}

const p200 = computed(() => store.statsLast200.playerPercentage)
const t200 = computed(() => store.statsLast200.tiePercentage)
const b200 = computed(() => store.statsLast200.bankerPercentage)

const p50 = computed(() => store.statsLast50Sync.playerPercentage)
const t50 = computed(() => store.statsLast50Sync.tiePercentage)
const b50 = computed(() => store.statsLast50Sync.bankerPercentage)
</script>

<template>
  <section class="stats-bar" aria-label="Estadísticas">
    <div class="stats-bar__group">
      <h3 class="stats-bar__group-title">Últimas 200</h3>
      <div class="stats-bar__items">
        <div class="stats-bar__item stats-bar__item--player">
          <span class="stats-bar__label">P</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--player" :style="{ width: `${p200}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(p200) }}</span>
        </div>
        <div class="stats-bar__item stats-bar__item--tie">
          <span class="stats-bar__label">T</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--tie" :style="{ width: `${t200}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(t200) }}</span>
        </div>
        <div class="stats-bar__item stats-bar__item--banker">
          <span class="stats-bar__label">B</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--banker" :style="{ width: `${b200}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(b200) }}</span>
        </div>
      </div>
    </div>
    <div class="stats-bar__group">
      <h3 class="stats-bar__group-title">Sync Casino (50)</h3>
      <div class="stats-bar__items">
        <div class="stats-bar__item stats-bar__item--player">
          <span class="stats-bar__label">P</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--player" :style="{ width: `${p50}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(p50) }}</span>
        </div>
        <div class="stats-bar__item stats-bar__item--tie">
          <span class="stats-bar__label">T</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--tie" :style="{ width: `${t50}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(t50) }}</span>
        </div>
        <div class="stats-bar__item stats-bar__item--banker">
          <span class="stats-bar__label">B</span>
          <div class="stats-bar__bar">
            <div class="stats-bar__fill stats-bar__fill--banker" :style="{ width: `${b50}%` }"></div>
          </div>
          <span class="stats-bar__value">{{ formatPercent(b50) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-bar {
  display: flex;
  gap: 24px;
}

.stats-bar__group {
  flex: 1;
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px;
}

.stats-bar__group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
}

.stats-bar__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stats-bar__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-bar__label {
  font-size: 12px;
  font-weight: 700;
  width: 18px;
  text-align: center;
  font-family: monospace;
}

.stats-bar__item--player .stats-bar__label {
  color: var(--color-player);
}

.stats-bar__item--tie .stats-bar__label {
  color: var(--color-tie);
}

.stats-bar__item--banker .stats-bar__label {
  color: var(--color-banker);
}

.stats-bar__bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg);
  border-radius: 4px;
  overflow: hidden;
}

.stats-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stats-bar__fill--player {
  background: var(--color-player);
}

.stats-bar__fill--tie {
  background: var(--color-tie);
}

.stats-bar__fill--banker {
  background: var(--color-banker);
}

.stats-bar__value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 45px;
  text-align: right;
  font-family: monospace;
}

@media (max-width: 768px) {
  .stats-bar {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
