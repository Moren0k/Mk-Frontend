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
    class="inline-block h-5 w-5 rounded-full sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-9 lg:w-9"
    :class="{
      'bg-bbp-player': state === 'player',
      'bg-bbp-banker': state === 'banker',
      'bg-bbp-tie': state === 'tie',
      'border-2 border-bbp-border-strong bg-transparent': state === 'empty',
    }"
    role="img"
    :aria-label="stateLabels[state]"
  />
</template>
