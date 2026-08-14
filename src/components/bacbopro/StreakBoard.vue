<script setup lang="ts">
import type { StreakColumn } from '@/types/bacbopro'
import StreakColumnVue from './StreakColumn.vue'

interface Props {
  columns: StreakColumn[]
}

defineProps<Props>()
</script>

<template>
  <section
    aria-label="Tablero de rachas"
    class="w-full min-w-0 rounded-lg border border-bbp-border bg-bbp-panel p-3 sm:p-4"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      TABLERO DE RACHAS
    </h2>
    <div class="bbp-scroll mt-4 w-full overflow-x-auto">
      <div class="mx-auto flex w-fit max-w-full items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        <StreakColumnVue v-for="(column, index) in columns" :key="index" :column="column" />
      </div>
    </div>
  </section>
</template>
