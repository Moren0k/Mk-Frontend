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
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge--win {
  background: rgba(34, 197, 94, 0.15);
  color: var(--color-win);
}

.status-badge--loss {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-loss);
}

.status-badge--waiting {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-waiting);
}

.status-badge--mg1 {
  background: rgba(139, 92, 246, 0.15);
  color: var(--color-mg1);
}

.status-badge--mg2 {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-mg2);
}

.status-badge--ep {
  background: rgba(6, 182, 212, 0.15);
  color: var(--color-ep);
}
</style>
