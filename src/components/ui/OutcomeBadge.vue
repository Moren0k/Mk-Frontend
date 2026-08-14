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
  border-radius: 0.25rem;
  font-weight: 700;
  font-family: monospace;
  line-height: 1;
}

.outcome-badge--sm {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.6875rem;
}

.outcome-badge--md {
  width: 2rem;
  height: 2rem;
  font-size: 0.875rem;
}

.outcome-badge--lg {
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
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
