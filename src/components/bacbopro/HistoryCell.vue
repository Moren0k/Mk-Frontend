<script setup lang="ts">
import type { Outcome } from '@/types/bacbopro'

interface Props {
  state: Outcome
}

defineProps<Props>()

const stateLabels: Record<Outcome, string> = {
  player: 'Player',
  banker: 'Banker',
  tie: 'Tie',
  empty: 'Vacío',
}
</script>

<template>
  <span
    class="inline-block h-2.5 w-2.5 rounded-full sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
    :class="{
      'bg-bbp-player': state === 'player',
      'bg-bbp-banker': state === 'banker',
      'bg-bbp-tie': state === 'tie',
      'border border-bbp-border-strong bg-transparent': state === 'empty',
    }"
    role="img"
    :aria-label="stateLabels[state]"
  />
</template>
