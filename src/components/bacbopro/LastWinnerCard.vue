<script setup lang="ts">
import type { WinnerOutcome } from '@/types/bacbopro'
import WinnerIndicator from './WinnerIndicator.vue'

interface Props {
  winner: WinnerOutcome | null
  embedded?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  winner: null,
  embedded: false,
  loading: false,
})
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
      <p
        v-if="loading"
        class="py-4 text-sm font-semibold tracking-wider text-gray-400"
      >
        CARGANDO…
      </p>
      <p
        v-else-if="!winner"
        class="py-4 text-sm font-semibold tracking-wider text-gray-400"
      >
        SIN JUGADAS
      </p>
      <WinnerIndicator v-else :winner="winner" />
    </div>
  </section>
</template>
