<script setup lang="ts">
import { computed } from 'vue'
import type { NonEmptyOutcome, StatsSegment } from '@/types/bacbopro'

interface Props {
  segments: StatsSegment[]
}

const props = defineProps<Props>()

const dominantOutcome = computed<Exclude<NonEmptyOutcome, 'tie'> | null>(() => {
  const playerPct = props.segments.find((segment) => segment.outcome === 'player')?.percentage ?? 0
  const bankerPct = props.segments.find((segment) => segment.outcome === 'banker')?.percentage ?? 0
  if (playerPct === bankerPct) return null
  return playerPct > bankerPct ? 'player' : 'banker'
})

function isDominant(outcome: StatsSegment['outcome']): boolean {
  return outcome !== 'tie' && outcome === dominantOutcome.value
}

function isSubdued(outcome: StatsSegment['outcome']): boolean {
  return outcome !== 'tie' && dominantOutcome.value !== null && outcome !== dominantOutcome.value
}
</script>

<template>
  <div>
    <div class="flex" aria-hidden="true">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="relative h-4"
        :style="{ width: `${segment.percentage}%` }"
      >
        <span
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-semibold tracking-wider transition-all duration-300"
          :class="[
            isDominant(segment.outcome) ? 'text-sm' : 'text-[0.625rem]',
            isSubdued(segment.outcome) ? 'opacity-40' : '',
            {
              'text-bbp-player': segment.outcome === 'player',
              'text-bbp-tie': segment.outcome === 'tie',
              'text-bbp-banker': segment.outcome === 'banker',
            },
          ]"
          :style="{
            textShadow: isDominant(segment.outcome)
              ? '0 0 12px currentColor, 0 0 4px currentColor'
              : isSubdued(segment.outcome)
                ? 'none'
                : '0 0 6px currentColor',
          }"
        >
          {{ segment.outcome === 'tie' ? '' : segment.label }}
        </span>
      </div>
    </div>

    <div class="mt-1 flex h-9 w-full overflow-hidden rounded-md">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="h-full transition-all duration-300"
        :class="[
          isSubdued(segment.outcome) ? 'opacity-45' : '',
          {
            'bg-bbp-player': segment.outcome === 'player',
            'bg-bbp-tie': segment.outcome === 'tie',
            'bg-bbp-banker': segment.outcome === 'banker',
          },
        ]"
        :style="{
          width: `${segment.percentage}%`,
          boxShadow: isDominant(segment.outcome)
            ? `inset 0 0 16px color-mix(in srgb, white 35%, transparent), 0 0 18px color-mix(in srgb, ${
                segment.outcome === 'player' ? 'var(--color-bbp-player)' : 'var(--color-bbp-banker)'
              } 70%, transparent)`
            : 'none',
        }"
        :aria-label="`${segment.label} ${segment.percentage}%`"
      />
    </div>

    <div class="mt-1 flex" aria-hidden="true">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="relative h-4"
        :style="{ width: `${segment.percentage}%` }"
      >
        <span
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-mono transition-all duration-300"
          :class="[
            isDominant(segment.outcome)
              ? 'text-sm font-bold text-gray-100'
              : segment.outcome === 'tie'
                ? 'text-[0.5rem] text-gray-500'
                : 'text-[0.6875rem] text-gray-400',
            isSubdued(segment.outcome) ? 'opacity-40' : '',
          ]"
        >
          {{ segment.percentage }}%
        </span>
      </div>
    </div>
  </div>
</template>
