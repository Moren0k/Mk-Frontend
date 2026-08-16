<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Outcome } from '@/types/bacbopro'
import { useBacboproStore } from '@/stores/bacbopro'
import { buildStreakLengthFlags, projectToHistoryGrid } from '@/mappers/bacboproMapper'
import type { StreakLengthFilter } from '@/mappers/bacboproMapper'
import HistoryGrid from './HistoryGrid.vue'

interface Props {
  grid: Outcome[][]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  grid: () => [],
  loading: false,
})

const store = useBacboproStore()

const isEmpty = computed(
  () =>
    !store.oficialPendingHistoryCell &&
    (props.grid.length === 0 || props.grid.flat().every((cell) => cell === 'empty')),
)

// Botones de racha (misma idea que las líneas de referencia del tablero de
// rachas, pero acá resaltan directamente las jugadas): 3/4/5 son rachas de
// EXACTAMENTE esa longitud; "L" es la cola de dragón (6 o más), igual que en
// el Big Road. Solo uno de estos — o el modo "." — puede estar activo a la vez.
const STREAK_FILTER_OPTIONS: { value: StreakLengthFilter; label: string }[] = [
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 'L', label: 'L' },
]

const activeStreakFilter = ref<StreakLengthFilter | null>(null)
const dotModeActive = ref(false)
const selectedRoundIds = ref<Set<string>>(new Set())

function toggleStreakFilter(value: StreakLengthFilter): void {
  dotModeActive.value = false
  activeStreakFilter.value = activeStreakFilter.value === value ? null : value
}

function toggleDotMode(): void {
  activeStreakFilter.value = null
  dotModeActive.value = !dotModeActive.value
  if (!dotModeActive.value) selectedRoundIds.value = new Set()
}

// IMPORTANTE: la ventana real que se ve en pantalla es `store.historyColumns`
// (se arma incrementalmente desde que abrió la conexión, sin resetearse
// nunca). `store.historyOutcomes` en cambio es "los últimos 200 del store" —
// una ventana de tamaño *fijo* que se recorta en cada jugada nueva. Como 200
// no es múltiplo de HISTORY_ROWS (6), reconstruir el chunking de columnas
// desde cero sobre esos 200 producía un offset de fase distinto al de
// `historyColumns` cada vez que llegaba una jugada (los agrupamientos de 6
// no coincidían), y por eso las rachas se veían desalineadas y el punto
// apuntaba a la celda equivocada. La única fuente confiable es la ventana
// REAL ya construida por el store: aplanamos `historyColumns` en el mismo
// orden column-major en que se construyó (es exactamente el orden
// cronológico de esas jugadas) y usamos ese mismo array como base tanto
// para las rachas como para ubicar los roundId.
const visibleOutcomes = computed(() => store.historyColumns.flat())

// Los últimos N elementos de `store.history` (con roundId) son, jugada por
// jugada, las mismas que componen `visibleOutcomes` — ambos derivan de la
// misma secuencia de eventos, solo que `history` guarda hasta 200 y
// `historyColumns` recorta a la ventana visible (como mucho 132).
const visibleRoundIds = computed(() =>
  store.history.slice(-visibleOutcomes.value.length).map((item) => item.roundId),
)

// roundId de cada celda visible, en la misma posición fila/columna que
// `grid` — permite que una selección en modo "." siga a LA JUGADA (no a la
// posición) cuando el tablero corre al llegar un resultado nuevo.
const roundIdGrid = computed(() =>
  projectToHistoryGrid(visibleOutcomes.value, visibleRoundIds.value, null),
)

const highlightGrid = computed<boolean[][] | null>(() => {
  if (activeStreakFilter.value) {
    const flags = buildStreakLengthFlags(visibleOutcomes.value, activeStreakFilter.value)
    return projectToHistoryGrid(visibleOutcomes.value, flags, false)
  }
  if (dotModeActive.value) {
    return roundIdGrid.value.map((row) =>
      row.map((roundId) => (roundId ? selectedRoundIds.value.has(roundId) : false)),
    )
  }
  return null
})

function handleCellSelect(row: number, column: number): void {
  if (!dotModeActive.value) return
  const roundId = roundIdGrid.value[row]?.[column]
  if (!roundId) return
  const next = new Set(selectedRoundIds.value)
  if (next.has(roundId)) next.delete(roundId)
  else next.add(roundId)
  selectedRoundIds.value = next
}
</script>

<template>
  <section
    aria-label="Últimas jugadas"
    class="bbp-elevation-1 w-full min-w-0 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <h2 class="min-w-0 text-center text-xs font-bold tracking-[0.15em] text-gray-300">
        ÚLTIMAS JUGADAS
      </h2>
      <div
        role="group"
        aria-label="Filtro de rachas de últimas jugadas"
        class="flex shrink-0 items-center gap-1"
      >
        <button
          v-for="option in STREAK_FILTER_OPTIONS"
          :key="option.value"
          type="button"
          :aria-pressed="activeStreakFilter === option.value"
          :aria-label="`Resaltar rachas de ${option.label}`"
          class="flex h-5 w-5 items-center justify-center rounded border text-[0.625rem] font-bold leading-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          :class="
            activeStreakFilter === option.value
              ? 'border-bbp-active/50 bg-bbp-active/15 text-bbp-active'
              : 'border-bbp-border text-gray-500 hover:border-bbp-border-strong hover:text-gray-300'
          "
          @click="toggleStreakFilter(option.value)"
        >
          {{ option.label }}
        </button>
        <button
          type="button"
          :aria-pressed="dotModeActive"
          aria-label="Seleccionar jugadas individuales"
          class="flex h-5 w-5 items-center justify-center rounded border text-[0.625rem] font-bold leading-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          :class="
            dotModeActive
              ? 'border-bbp-active/50 bg-bbp-active/15 text-bbp-active'
              : 'border-bbp-border text-gray-500 hover:border-bbp-border-strong hover:text-gray-300'
          "
          @click="toggleDotMode"
        >
          .
        </button>
      </div>
    </div>

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
      <HistoryGrid
        v-else
        :grid="grid"
        :highlight-grid="highlightGrid"
        :selectable="dotModeActive"
        :pending-cell="store.oficialPendingHistoryCell"
        @select="handleCellSelect"
      />
    </div>
  </section>
</template>
