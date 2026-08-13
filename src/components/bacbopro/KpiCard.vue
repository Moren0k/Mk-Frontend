<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'

interface Props {
  item: KpiItem
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border border-bbp-border bg-bbp-panel p-4">
    <p class="text-xs font-bold tracking-[0.15em] text-gray-400">{{ item.label }}</p>
    <p
      class="mt-1.5 text-2xl font-bold"
      :class="{
        'text-bbp-tie': item.tone === 'yellow',
        'text-bbp-banker': item.tone === 'red',
        'text-bbp-active': item.tone === 'green',
        'font-mono text-gray-100': item.tone === 'mono',
      }"
    >
      {{ item.value }}
    </p>
  </div>
</template>
