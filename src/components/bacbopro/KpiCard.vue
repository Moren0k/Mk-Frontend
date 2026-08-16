<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'

interface Props {
  item: KpiItem
}

defineProps<Props>()
</script>

<template>
  <div class="min-w-0 bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel p-5 text-center sm:p-6">
    <p class="break-words text-xs font-bold tracking-[0.15em] text-gray-400">{{ item.label }}</p>
    <p
      class="mt-3 text-2xl font-bold"
      :class="{
        'text-bbp-tie [text-shadow:0_0_10px_currentColor]': item.tone === 'yellow',
        'text-bbp-banker [text-shadow:0_0_10px_currentColor]': item.tone === 'red',
        'text-bbp-active [text-shadow:0_0_10px_currentColor]': item.tone === 'green',
        'font-mono text-gray-100': item.tone === 'mono',
      }"
    >
      {{ item.value }}
    </p>
  </div>
</template>
