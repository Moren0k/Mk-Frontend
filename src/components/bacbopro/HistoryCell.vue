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
    class="inline-block h-2.5 w-2.5 shrink-0 rounded-full sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 xl:h-5 xl:w-5"
    :class="{
      'bg-bbp-player shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-player)_40%,transparent)]':
        state === 'player',
      'bg-bbp-banker shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-banker)_40%,transparent)]':
        state === 'banker',
      'bg-bbp-tie shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-tie)_40%,transparent)]':
        state === 'tie',
      'border border-bbp-border-strong bg-transparent': state === 'empty',
    }"
    role="img"
    :aria-label="stateLabels[state]"
  />
</template>
