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
  <section aria-label="Últimas jugadas" class="rounded-lg border border-bbp-border bg-bbp-panel p-4">
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      ÚLTIMAS JUGADAS
    </h2>

    <div
      class="mt-4 grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_minmax(220px,1fr)] lg:gap-8 xl:gap-10"
    >
      <div class="lg:justify-self-center">
        <HistoryGrid :grid="grid" />
      </div>

      <div
        class="flex w-full max-w-lg flex-col justify-center gap-5 self-center justify-self-center"
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
