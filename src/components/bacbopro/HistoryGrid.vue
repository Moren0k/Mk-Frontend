<script setup lang="ts">
import type { Outcome, PendingAlertCell } from '@/types/bacbopro'
import HistoryCell from './HistoryCell.vue'

interface Props {
  grid: Outcome[][]
  /** Grid boolean (misma forma que `grid`) con qué celdas deben verse
   * resaltadas. `null` significa "sin filtro activo": todas normales. */
  highlightGrid?: boolean[][] | null
  selectable?: boolean
  /** Celda de la próxima jugada esperada (alerta oficial abierta), si hay. */
  pendingCell?: PendingAlertCell | null
}

withDefaults(defineProps<Props>(), {
  highlightGrid: null,
  selectable: false,
  pendingCell: null,
})

const emit = defineEmits<{ select: [row: number, column: number] }>()
</script>

<template>
  <div
    class="grid w-full grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px] sm:gap-1"
    aria-label="Historial de últimas 200 jugadas"
  >
    <template v-for="(row, rowIndex) in grid" :key="rowIndex">
      <HistoryCell
        v-for="(cell, cellIndex) in row"
        :key="`${rowIndex}-${cellIndex}`"
        :state="pendingCell?.row === rowIndex && pendingCell.column === cellIndex ? pendingCell.side : cell"
        :pending="pendingCell?.row === rowIndex && pendingCell.column === cellIndex"
        :dimmed="highlightGrid ? !highlightGrid[rowIndex]?.[cellIndex] : false"
        :selectable="selectable"
        @select="emit('select', rowIndex, cellIndex)"
      />
    </template>
  </div>
</template>
