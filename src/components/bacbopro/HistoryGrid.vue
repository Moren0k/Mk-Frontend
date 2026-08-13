<script setup lang="ts">
import type { Outcome } from '@/types/bacbopro'
import HistoryCell from './HistoryCell.vue'

interface Props {
  grid: Outcome[][]
}

defineProps<Props>()
</script>

<template>
  <div class="bbp-scroll overflow-x-auto" aria-label="Historial de últimas 200 jugadas">
    <div class="mx-auto grid w-fit grid-cols-16 justify-items-center gap-1 sm:gap-1.5 md:gap-2">
      <template v-for="(row, rowIndex) in grid" :key="rowIndex">
        <HistoryCell
          v-for="(cell, cellIndex) in row"
          :key="`${rowIndex}-${cellIndex}`"
          :state="cell"
        />
      </template>
    </div>
  </div>
</template>
