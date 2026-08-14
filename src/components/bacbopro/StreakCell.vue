<script setup lang="ts">
import type { StreakCellState } from '@/types/bacbopro'

interface Props {
  state: StreakCellState
}

defineProps<Props>()

const stateLabels: Record<StreakCellState, string> = {
  player: 'Player',
  banker: 'Banker',
  tie: 'Tie',
  empty: 'Vacío',
}
</script>

<template>
  <span
    class="inline-block h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9"
    :class="{
      'bg-bbp-player shadow-[0_0_6px_color-mix(in_srgb,var(--color-bbp-player)_45%,transparent)]':
        state === 'player',
      'bg-bbp-banker shadow-[0_0_6px_color-mix(in_srgb,var(--color-bbp-banker)_45%,transparent)]':
        state === 'banker',
      'bg-bbp-tie shadow-[0_0_6px_color-mix(in_srgb,var(--color-bbp-tie)_45%,transparent)]':
        state === 'tie',
      'border-2 border-bbp-border-strong bg-transparent': state === 'empty',
    }"
    role="img"
    :aria-label="stateLabels[state]"
  />
</template>
