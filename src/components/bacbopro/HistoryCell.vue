<script setup lang="ts">
import type { Outcome } from '@/types/bacbopro'

interface Props {
  state: Outcome
  dimmed?: boolean
  selectable?: boolean
  /** Celda de la PRÓXIMA jugada esperada (alerta oficial abierta): parpadea
   * con el color de `state` ('player' o 'banker') y no es un resultado real,
   * así que nunca se opaca ni se puede seleccionar. */
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dimmed: false,
  selectable: false,
  pending: false,
})

const emit = defineEmits<{ select: [] }>()

const stateLabels: Record<Outcome, string> = {
  player: 'Player',
  banker: 'Banker',
  tie: 'Tie',
  empty: 'Vacío',
}

function handleSelect(): void {
  if (props.pending || !props.selectable || props.state === 'empty') return
  emit('select')
}
</script>

<template>
  <span
    class="aspect-square w-full min-w-[4px] rounded-full transition-opacity duration-200"
    :class="{
      'bg-bbp-player shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-player)_40%,transparent)]':
        state === 'player',
      'bg-bbp-banker shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-banker)_40%,transparent)]':
        state === 'banker',
      'bg-bbp-tie shadow-[0_0_4px_color-mix(in_srgb,var(--color-bbp-tie)_40%,transparent)]':
        state === 'tie',
      'border border-bbp-border-strong bg-transparent': state === 'empty',
      'bbp-blink': pending,
      'opacity-25': dimmed && !pending,
      'cursor-pointer': selectable && !pending && state !== 'empty',
    }"
    :role="selectable && !pending && state !== 'empty' ? 'button' : 'img'"
    :tabindex="selectable && !pending && state !== 'empty' ? 0 : undefined"
    :aria-pressed="selectable && !pending && state !== 'empty' ? !dimmed : undefined"
    :aria-label="pending ? `Próxima jugada esperada: ${stateLabels[state]}` : stateLabels[state]"
    @click="handleSelect"
    @keydown.enter="handleSelect"
    @keydown.space.prevent="handleSelect"
  />
</template>
