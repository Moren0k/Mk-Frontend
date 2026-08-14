<script setup lang="ts">
import type { OperationState } from '@/types/baccarat'

defineProps<{
  state: OperationState
}>()
</script>

<template>
  <span class="status-badge" :class="`status-badge--${state.toLowerCase()}`">
    {{ state }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge--win {
  background: rgba(57, 255, 20, 0.15);
  background: color-mix(in srgb, var(--color-win) 15%, transparent);
  color: var(--color-win);
}

.status-badge--loss {
  background: rgba(255, 23, 68, 0.15);
  background: color-mix(in srgb, var(--color-loss) 15%, transparent);
  color: var(--color-loss);
}

.status-badge--waiting {
  background: rgba(255, 158, 0, 0.15);
  background: color-mix(in srgb, var(--color-waiting) 15%, transparent);
  color: var(--color-waiting);
}

.status-badge--mg1 {
  background: rgba(213, 0, 249, 0.15);
  background: color-mix(in srgb, var(--color-mg1) 15%, transparent);
  color: var(--color-mg1);
}

.status-badge--mg2 {
  background: rgba(124, 77, 255, 0.15);
  background: color-mix(in srgb, var(--color-mg2) 15%, transparent);
  color: var(--color-mg2);
}

.status-badge--ep {
  background: rgba(0, 229, 255, 0.15);
  background: color-mix(in srgb, var(--color-ep) 15%, transparent);
  color: var(--color-ep);
}
</style>
