<script setup lang="ts">
import type { Outcome, StatsBlock } from '@/types/bacbopro'
import HistoryGrid from './HistoryGrid.vue'
import StatsBar from './StatsBar.vue'

interface Props {
  grid: Outcome[][]
  statsBlocks: StatsBlock[]
}

defineProps<Props>()
</script>

<template>
  <section
    aria-label="Últimas jugadas"
    class="w-full min-w-0 rounded-lg border border-bbp-border bg-bbp-panel p-3 sm:p-4"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      ÚLTIMAS JUGADAS
    </h2>

    <div
      class="mt-4 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 xl:gap-10"
    >
      <div class="min-w-0 lg:justify-self-center">
        <HistoryGrid :grid="grid" />
      </div>

      <div
        class="flex w-full min-w-0 max-w-lg flex-col justify-center gap-5 self-center justify-self-center lg:max-w-full"
      >
        <div v-for="block in statsBlocks" :key="block.title" class="w-full">
          <h3 class="text-center text-sm font-semibold tracking-[0.2em] text-gray-400">
            {{ block.title }}
          </h3>
          <StatsBar class="mt-2" :segments="block.segments" />
        </div>
      </div>
    </div>
  </section>
</template>
