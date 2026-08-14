<script setup lang="ts">
defineProps<{
  value: number
  max?: number
  label?: string
}>()
</script>

<template>
  <div class="progress-bar" role="progressbar" :aria-valuenow="value" :aria-valuemax="max ?? 100">
    <div class="progress-bar__track">
      <div
        class="progress-bar__fill"
        :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
      ></div>
    </div>
    <span v-if="label" class="progress-bar__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
}

.progress-bar__track {
  flex: 1;
  height: 0.375rem;
  background: var(--color-surface-dark);
  border-radius: 0.1875rem;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-ep);
  border-radius: 0.1875rem;
  transition: width 0.3s ease;
}

.progress-bar__label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
