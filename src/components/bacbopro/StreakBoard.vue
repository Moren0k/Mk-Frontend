<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { Outcome } from '@/types/bacbopro'
import { STREAK_DISPLAY_COLUMNS, STREAK_MAX_ROWS } from '@/mappers/bacboproMapper'
import { useBacboproStore } from '@/stores/bacbopro'
import StreakCell from './StreakCell.vue'

interface Props {
  /** Columnas del Big Road, column-major (columns[columna][fila]), ya
   * acotadas a STREAK_DISPLAY_COLUMNS. Si hay una alerta oficial abierta,
   * ya viene con la columna de la próxima jugada esperada incluida (ver
   * `streakDisplayColumns` en el store) — así nunca queda superpuesta sobre
   * una columna real. */
  columns: Outcome[][]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  loading: false,
})

const store = useBacboproStore()

const isEmpty = computed(() => props.columns.length === 0)

// El tablero nunca hace scroll lateral: siempre tiene un ancho fijo de
// STREAK_DISPLAY_COLUMNS, así que lo convertimos a fila x columna (como el
// tablero de últimas jugadas) para dibujarlo con un grid de columnas fijas
// y celdas fluidas que se ajustan solas al ancho disponible.
const grid = computed<Outcome[][]>(() => {
  const rows: Outcome[][] = []
  for (let row = 0; row < STREAK_MAX_ROWS; row++) {
    const cells: Outcome[] = []
    for (let column = 0; column < STREAK_DISPLAY_COLUMNS; column++) {
      cells.push(props.columns[column]?.[row] ?? 'empty')
    }
    rows.push(cells)
  }
  return rows
})

// Líneas de referencia de nivel de racha: fila 3, 4, 5 y la última fila (6,
// donde también se forma la cola de dragón), marcada como "L".
const LEVEL_OPTIONS = [
  { row: 3, label: '3' },
  { row: 4, label: '4' },
  { row: 5, label: '5' },
  { row: STREAK_MAX_ROWS, label: 'L' },
] as const

const activeLevels = reactive(new Set<number>())

function toggleLevel(row: number): void {
  if (activeLevels.has(row)) activeLevels.delete(row)
  else activeLevels.add(row)
}
</script>

<template>
  <section
    aria-label="Tablero de rachas"
    class="bbp-elevation-1 w-full min-w-0 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <h2 class="min-w-0 text-center text-xs font-bold tracking-[0.15em] text-gray-300">
        TABLERO DE RACHAS
      </h2>
      <div
        role="group"
        aria-label="Líneas de referencia de nivel de racha"
        class="flex shrink-0 items-center gap-1"
      >
        <button
          v-for="option in LEVEL_OPTIONS"
          :key="option.row"
          type="button"
          :aria-pressed="activeLevels.has(option.row)"
          :aria-label="`Mostrar línea de referencia en la fila ${option.row}`"
          class="flex h-5 w-5 items-center justify-center rounded border text-[0.625rem] font-bold leading-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          :class="
            activeLevels.has(option.row)
              ? 'border-bbp-active/50 bg-bbp-active/15 text-bbp-active'
              : 'border-bbp-border text-gray-500 hover:border-bbp-border-strong hover:text-gray-300'
          "
          @click="toggleLevel(option.row)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-4 w-full">
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
      <div v-else class="relative w-full">
        <div
          v-for="row in LEVEL_OPTIONS.map((option) => option.row)"
          v-show="activeLevels.has(row)"
          :key="row"
          class="pointer-events-none absolute inset-x-0 z-0 border-t border-dashed border-bbp-border-strong/70"
          :style="{ top: `calc((${row} - 0.5) * (100% / ${STREAK_MAX_ROWS}))` }"
          aria-hidden="true"
        />
        <div
          class="relative z-10 grid w-full gap-[3px] sm:gap-1"
          :style="{ gridTemplateColumns: `repeat(${STREAK_DISPLAY_COLUMNS}, minmax(0, 1fr))` }"
        >
          <template v-for="(row, rowIndex) in grid" :key="rowIndex">
            <StreakCell
              v-for="(cell, cellIndex) in row"
              :key="`${rowIndex}-${cellIndex}`"
              :state="cell"
              :pending="
                store.oficialPendingStreakCell?.row === rowIndex &&
                store.oficialPendingStreakCell.column === cellIndex
              "
            />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
