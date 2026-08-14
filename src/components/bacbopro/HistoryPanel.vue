<script setup lang="ts">
import { computed } from 'vue'
import type { Outcome } from '@/types/bacbopro'
import HistoryGrid from './HistoryGrid.vue'

interface Props {
  grid: Outcome[][]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  grid: () => [],
  loading: false,
})

const isEmpty = computed(() =>
  props.grid.length === 0 || props.grid.flat().every((cell) => cell === 'empty'),
)
</script>

<template>
  <section
    aria-label="Últimas jugadas"
    class="w-full min-w-0 rounded-lg border border-bbp-border bg-bbp-panel p-3 sm:p-4"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      ÚLTIMAS JUGADAS
    </h2>

    <div class="mt-4 w-full min-w-0">
      <p
        v-if="loading"
        class="py-4 text-center text-sm font-semibold tracking-wider text-gray-400"
      >
        CARGANDO…
      </p>
      <p
        v-else-if="isEmpty"
        class="py-4 text-center text-sm font-semibold tracking-wider text-gray-400"
      >
        SIN JUGADAS
      </p>
      <HistoryGrid v-else :grid="grid" />
    </div>
  </section>
</template>
