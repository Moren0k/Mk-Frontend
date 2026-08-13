<script setup lang="ts">
import type { WinnerOutcome } from '@/types/bacbopro'
import WinnerIndicator from './WinnerIndicator.vue'

interface Props {
  winner: WinnerOutcome
  embedded?: boolean
}

defineProps<Props>()
</script>

<template>
  <section
    aria-label="Último ganador"
    :class="embedded ? 'p-4' : 'rounded-lg border border-bbp-border bg-bbp-panel p-4'"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      ÚLTIMO GANADOR
    </h2>

    <div class="mt-4 flex justify-center">
      <WinnerIndicator :winner="winner" />
    </div>
  </section>
</template>
