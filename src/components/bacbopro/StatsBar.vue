<script setup lang="ts">
import type { StatsSegment } from '@/types/bacbopro'

interface Props {
  segments: StatsSegment[]
}

defineProps<Props>()
</script>

<template>
  <div>
    <div class="flex" aria-hidden="true">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="overflow-hidden whitespace-nowrap text-center text-[10px] font-semibold tracking-wider"
        :class="{
          'text-bbp-player': segment.outcome === 'player',
          'text-bbp-tie': segment.outcome === 'tie',
          'text-bbp-banker': segment.outcome === 'banker',
        }"
        :style="{ width: `${segment.percentage}%` }"
      >
        {{ segment.label }}
      </div>
    </div>

    <div class="mt-1 flex h-9 w-full overflow-hidden rounded-md">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="h-full"
        :class="{
          'bg-bbp-player': segment.outcome === 'player',
          'bg-bbp-tie': segment.outcome === 'tie',
          'bg-bbp-banker': segment.outcome === 'banker',
        }"
        :style="{ width: `${segment.percentage}%` }"
        :aria-label="`${segment.label} ${segment.percentage}%`"
      />
    </div>

    <div class="mt-1 flex" aria-hidden="true">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="overflow-hidden whitespace-nowrap text-center font-mono text-[11px] text-gray-300"
        :style="{ width: `${segment.percentage}%` }"
      >
        {{ segment.percentage }}%
      </div>
    </div>
  </div>
</template>
