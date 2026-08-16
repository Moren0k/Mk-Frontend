<script setup lang="ts">
import type { StreakCellState } from '@/types/bacbopro'

interface Props {
  state: StreakCellState
  /** Celda de la PRÓXIMA jugada esperada (alerta oficial abierta): parpadea
   * con el color de `state` ('player' o 'banker'); no es un resultado real. */
  pending?: boolean
}

withDefaults(defineProps<Props>(), {
  pending: false,
})

const stateLabels: Record<StreakCellState, string> = {
  player: 'Player',
  banker: 'Banker',
  tie: 'Tie',
  empty: 'Vacío',
}
</script>

<template>
  <span
    class="aspect-square w-full min-w-[4px] rounded-full"
    :class="{
      'bg-bbp-player shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-player)_40%,transparent)]':
        state === 'player',
      'bg-bbp-banker shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-banker)_40%,transparent)]':
        state === 'banker',
      'bg-bbp-tie shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-tie)_40%,transparent)]':
        state === 'tie',
      'bg-transparent': state === 'empty',
      'bbp-blink': pending,
    }"
    :role="state === 'empty' ? undefined : 'img'"
    :aria-label="
      state === 'empty' ? undefined : pending ? `Próxima jugada esperada: ${stateLabels[state]}` : stateLabels[state]
    "
    :aria-hidden="state === 'empty' ? true : undefined"
  />
</template>
