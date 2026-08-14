<script setup lang="ts">
import { computed, ref } from 'vue'
import type { OperationEntry, OperationSide } from '@/types/bacbopro'

interface Props {
  operation: OperationEntry | null
  channelLabel?: string
  embedded?: boolean
  loading?: boolean
  cancelling?: boolean
  cancelError?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  channelLabel: '',
  embedded: false,
  loading: false,
  cancelling: false,
  cancelError: null,
})

const emit = defineEmits<{
  cancel: []
  dismissError: []
}>()

const showCancelConfirm = ref(false)

const sideConfig: Record<OperationSide, { emoji: string; letter: string; color: string }> = {
  player: { emoji: '🔵', letter: 'P', color: 'var(--color-bbp-player)' },
  banker: { emoji: '🔴', letter: 'B', color: 'var(--color-bbp-banker)' },
  tie: { emoji: '🟡', letter: 'T', color: 'var(--color-bbp-tie)' },
}

const entryAfter = computed(() =>
  props.operation ? sideConfig[props.operation.entryAfterSide] : null,
)
const betOn = computed(() =>
  props.operation ? sideConfig[props.operation.betOnSide] : null,
)

const cancellableStates = new Set(['OPEN', 'MG1', 'MG2'])

const canCancel = computed(() => {
  if (!props.operation) return false
  return cancellableStates.has(props.operation.state)
})

function requestCancel(): void {
  showCancelConfirm.value = true
}

function cancelConfirmPending(): void {
  showCancelConfirm.value = false
}

function confirmCancel(): void {
  showCancelConfirm.value = false
  emit('cancel')
}
</script>

<template>
  <section
    aria-label="Operación actual"
    :class="embedded ? 'p-4' : 'rounded-lg border border-bbp-border bg-bbp-panel p-4'"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      OPERACIÓN ACTUAL
      <span v-if="channelLabel" class="ml-1 text-sm text-gray-500">— {{ channelLabel }}</span>
    </h2>

    <p
      v-if="loading"
      aria-live="polite"
      class="mt-3 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2 text-center text-sm font-semibold tracking-wider text-gray-400"
    >
      CARGANDO…
    </p>

    <p
      v-else-if="!operation"
      class="mt-3 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2 text-center text-sm font-semibold tracking-wider text-gray-400"
    >
      SIN OPERACIÓN ACTIVA
    </p>

    <template v-else-if="entryAfter && betOn">
      <p
        class="mt-3 rounded-md border border-bbp-tie/40 bg-bbp-tie/10 px-3 py-2 text-center text-base font-bold tracking-wider text-bbp-tie"
      >
        🚨 {{ operation.alertLabel }} 🚨
      </p>

      <div class="mt-3 flex flex-col gap-2">
        <div
          class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
        >
          <span class="text-xs tracking-wider text-gray-400">📊 ESTRATEGIA:</span>
          <span class="font-mono text-sm font-semibold text-gray-100">{{
            operation.strategyId
          }}</span>
        </div>

        <div
          class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
        >
          <span class="text-xs tracking-wider text-gray-400">🔍 PATRON:</span>
          <span class="text-sm font-semibold text-gray-100">{{ operation.pattern }}</span>
        </div>

        <div
          class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
        >
          <span class="text-xs tracking-wider text-gray-400">💣 INGRESAR DESPUES DE:</span>
          <span class="text-sm font-bold" :style="{ color: entryAfter.color }">
            {{ entryAfter.emoji }} {{ entryAfter.letter }}
          </span>
        </div>

        <div
          class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
        >
          <span class="text-xs tracking-wider text-gray-400">🔥 APUESTA EN:</span>
          <span class="text-sm font-bold" :style="{ color: betOn.color }">
            {{ betOn.emoji }} {{ betOn.letter }}
          </span>
        </div>

        <div
          class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
        >
          <span class="text-xs tracking-wider text-gray-400">🔁 MARTINGALAS MAXIMO:</span>
          <span class="font-mono text-xl font-bold text-gray-100">
            {{ operation.maxMartingales }}
          </span>
        </div>
      </div>

      <div
        v-if="cancelling"
        aria-live="polite"
        class="mt-3 w-full min-w-0 rounded-md border border-bbp-border bg-bbp-bg/60 px-2.5 py-2 text-center text-[0.625rem] font-semibold tracking-wider text-gray-400"
      >
        CANCELANDO OPERACIÓN…
      </div>

      <div
        v-else-if="cancelError"
        aria-live="polite"
        class="mt-3 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-bbp-banker/40 bg-bbp-banker/10 px-2.5 py-2"
      >
        <span class="text-[0.625rem] font-semibold tracking-wider text-bbp-banker">
          {{ cancelError }}
        </span>
        <button
          type="button"
          aria-label="Cerrar error de cancelación"
          class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
          @click="emit('dismissError')"
        >
          CERRAR
        </button>
      </div>

      <div v-if="canCancel && !cancelling" class="mt-3">
        <button
          v-if="!showCancelConfirm"
          type="button"
          class="w-full rounded-md border border-bbp-banker/40 bg-bbp-banker/10 px-2.5 py-1.5 text-[0.6875rem] font-bold tracking-wider text-bbp-banker transition-colors duration-200 hover:bg-bbp-banker/20"
          @click="requestCancel"
        >
          CANCELAR OPERACIÓN
        </button>

        <div
          v-else
          role="group"
          aria-label="Confirmar cancelación de operación"
          class="w-full min-w-0 rounded-md border border-bbp-border-strong bg-bbp-bg/60 p-3"
        >
          <p class="text-center text-[0.6875rem] font-bold tracking-[0.15em] text-bbp-tie">
            ¿CONFIRMAR CANCELACIÓN DE OPERACIÓN?
          </p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label="Cancelar confirmación de cancelación"
              class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
              @click="cancelConfirmPending"
            >
              NO
            </button>
            <button
              type="button"
              aria-label="Confirmar cancelación de operación"
              class="rounded border border-bbp-banker/40 bg-bbp-banker/10 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-bbp-banker transition-colors duration-200 hover:bg-bbp-banker/20"
              @click="confirmCancel"
            >
              SÍ, CANCELAR
            </button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
