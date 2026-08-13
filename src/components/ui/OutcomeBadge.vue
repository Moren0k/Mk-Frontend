<script setup lang="ts">
import type { Outcome } from '@/types/baccarat'

defineProps<{
  outcome: Outcome
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span
    class="outcome-badge"
    :class="[`outcome-badge--${outcome.toLowerCase()}`, `outcome-badge--${size ?? 'md'}`]"
    :aria-label="outcome"
  >
    {{ outcome === 'PLAYER' ? 'P' : outcome === 'BANKER' ? 'B' : 'T' }}
  </span>
</template>

<style scoped>
.outcome-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 700;
  font-family: monospace;
  line-height: 1;
}

.outcome-badge--sm {
  width: 24px;
  height: 24px;
  font-size: 11px;
}

.outcome-badge--md {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.outcome-badge--lg {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.outcome-badge--player {
  background: var(--color-player);
  color: #fff;
}

.outcome-badge--banker {
  background: var(--color-banker);
  color: #fff;
}

.outcome-badge--tie {
  background: var(--color-tie);
  color: #1a1a2e;
}
</style>
