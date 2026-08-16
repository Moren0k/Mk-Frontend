<script setup lang="ts">
import type { StatsBlock } from '@/types/bacbopro'
import StatsBar from './StatsBar.vue'

interface Props {
  blocks: StatsBlock[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  blocks: () => [],
  loading: false,
})
</script>

<template>
  <section
    aria-label="Estadísticas"
    class="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
  >
    <div
      v-if="loading"
      class="col-span-full min-w-0 bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
    >
      <p class="py-2 text-center text-sm font-semibold tracking-wider text-gray-400">
        CARGANDO…
      </p>
    </div>
    <div
      v-else-if="blocks.length === 0"
      class="col-span-full min-w-0 bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
    >
      <p class="py-2 text-center text-sm font-semibold tracking-wider text-gray-400">
        SIN DATOS
      </p>
    </div>
    <template v-else>
      <div
        v-for="block in blocks"
        :key="block.title"
        class="min-w-0 bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
      >
        <h3 class="text-center text-sm font-semibold tracking-[0.2em] text-gray-400">
          {{ block.title }}
        </h3>
        <StatsBar class="mt-4" :segments="block.segments" />
      </div>
    </template>
  </section>
</template>
