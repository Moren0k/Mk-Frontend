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
  box-shadow: 0 0 6px rgba(0, 176, 255, 0.5);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-player) 50%, transparent);
}

.outcome-badge--banker {
  background: var(--color-banker);
  color: #fff;
  box-shadow: 0 0 6px rgba(255, 23, 68, 0.5);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-banker) 50%, transparent);
}

.outcome-badge--tie {
  background: var(--color-tie);
  color: #1a1a2e;
  box-shadow: 0 0 6px rgba(255, 238, 0, 0.5);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-tie) 50%, transparent);
}
</style>
