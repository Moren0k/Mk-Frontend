<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'

interface Props {
  item: KpiItem
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel px-2 py-3 text-center sm:gap-1.5 sm:px-3 sm:py-4"
  >
    <p
      class="w-full break-words text-[0.6rem] font-bold leading-snug tracking-wide text-gray-400 sm:text-[0.7rem] sm:tracking-[0.08em]"
    >
      {{ item.label }}
    </p>
    <p
      class="w-full truncate text-lg font-bold leading-none sm:text-xl"
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
