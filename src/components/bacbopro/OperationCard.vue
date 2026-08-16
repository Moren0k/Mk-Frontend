<script setup lang="ts">
import { computed, ref } from 'vue'
import type { OperationDisplayState, OperationEntry, OperationSide } from '@/types/bacbopro'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { IconName } from '@/components/icons/AppIcon.vue'

interface Props {
  operation: OperationEntry | null
  channelLabel?: string
  embedded?: boolean
  loading?: boolean
  cancelling?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  channelLabel: '',
  embedded: false,
  loading: false,
  cancelling: false,
})

const emit = defineEmits<{
  cancel: []
}>()

const showCancelConfirm = ref(false)

const sideConfig: Record<OperationSide, { label: string; colorVar: string }> = {
  player: { label: 'Player', colorVar: 'var(--color-bbp-player)' },
  banker: { label: 'Banker', colorVar: 'var(--color-bbp-banker)' },
  tie: { label: 'Tie', colorVar: 'var(--color-bbp-tie)' },
}

// Cada estado tiene su propio ícono y color: el color deja de ser solo
// decorativo y pasa a comunicar el significado real del estado.
const STATE_BANNER: Record<
  OperationDisplayState,
  { icon: IconName; text: string; border: string; bg: string }
> = {
  OPEN: { icon: 'alert', text: 'text-bbp-tie', border: 'border-bbp-tie/40', bg: 'bg-bbp-tie/10' },
  MG1: { icon: 'repeat', text: 'text-bbp-mg1', border: 'border-bbp-mg1/40', bg: 'bg-bbp-mg1/10' },
  MG2: { icon: 'repeat', text: 'text-bbp-mg2', border: 'border-bbp-mg2/40', bg: 'bg-bbp-mg2/10' },
  WON: { icon: 'success', text: 'text-bbp-active', border: 'border-bbp-active/40', bg: 'bg-bbp-active/10' },
  LOST: { icon: 'error', text: 'text-bbp-banker', border: 'border-bbp-banker/40', bg: 'bg-bbp-banker/10' },
  CANCELLED: { icon: 'close', text: 'text-gray-400', border: 'border-bbp-border-strong', bg: 'bg-bbp-bg/60' },
}

const stateBanner = computed(() => (props.operation ? STATE_BANNER[props.operation.state] : null))

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
    :class="embedded ? 'p-2.5 sm:p-3' : 'rounded-lg border border-bbp-border bg-bbp-panel bbp-elevation-1 p-2.5 sm:p-3'"
  >
    <h2 v-if="channelLabel" class="text-center text-[0.6875rem] font-bold tracking-[0.15em] text-gray-400">
      {{ channelLabel }}
    </h2>

    <p
      v-if="loading"
      aria-live="polite"
      class="mt-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5 text-center text-xs font-semibold tracking-wider text-gray-400"
    >
      CARGANDO…
    </p>

    <p
      v-else-if="!operation"
      class="mt-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5 text-center text-xs font-semibold tracking-wider text-gray-400"
    >
      SIN OPERACIÓN ACTIVA
    </p>

    <template v-else-if="entryAfter && betOn && stateBanner">
      <p
        class="mt-2 flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-center text-xs font-bold tracking-wider"
        :class="[stateBanner.border, stateBanner.bg, stateBanner.text]"
      >
        <AppIcon :name="stateBanner.icon" :size="13" class="shrink-0" />
        <span>{{ operation.alertLabel }}</span>
      </p>

      <div class="mt-2.5 flex flex-col gap-1.5">
        <div
          class="flex flex-wrap items-start justify-between gap-1.5 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5"
        >
          <span class="flex min-w-0 items-center gap-1 text-[0.625rem] tracking-wider text-gray-400">
            <AppIcon name="strategy" :size="11" class="shrink-0" /> ESTRATEGIA
          </span>
          <span
            class="shrink-0 rounded-full border border-bbp-border-strong bg-bbp-bg/70 px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold text-gray-100"
          >
            {{ operation.strategyId }}
          </span>
        </div>

        <div class="rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5">
          <span class="flex items-center gap-1 text-[0.625rem] tracking-wider text-gray-400">
            <AppIcon name="pattern" :size="11" class="shrink-0" /> PATRÓN
          </span>
          <p class="mt-1 text-xs font-semibold leading-snug text-gray-100">
            {{ operation.pattern }}
          </p>
        </div>

        <div
          class="flex flex-wrap items-start justify-between gap-1.5 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5"
        >
          <span class="flex min-w-0 items-center gap-1 text-[0.625rem] tracking-wider text-gray-400">
            <AppIcon name="entry" :size="11" class="shrink-0" /> INGRESAR DESPUÉS DE
          </span>
          <span
            class="inline-block h-3 w-3 shrink-0 rounded-full"
            :style="{
              backgroundColor: entryAfter.colorVar,
              boxShadow: `0 0 6px color-mix(in srgb, ${entryAfter.colorVar} 55%, transparent)`,
            }"
            role="img"
            :aria-label="entryAfter.label"
          />
        </div>

        <div
          class="flex flex-wrap items-start justify-between gap-1.5 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5"
        >
          <span class="flex min-w-0 items-center gap-1 text-[0.625rem] tracking-wider text-gray-400">
            <AppIcon name="bet" :size="11" class="shrink-0" /> APUESTA EN
          </span>
          <span
            class="inline-block h-3 w-3 shrink-0 rounded-full"
            :style="{
              backgroundColor: betOn.colorVar,
              boxShadow: `0 0 6px color-mix(in srgb, ${betOn.colorVar} 55%, transparent)`,
            }"
            role="img"
            :aria-label="betOn.label"
          />
        </div>

        <div
          class="flex flex-wrap items-start justify-between gap-1.5 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5"
        >
          <span class="flex min-w-0 items-center gap-1 text-[0.625rem] tracking-wider text-gray-400">
            <AppIcon name="repeat" :size="11" class="shrink-0" /> MARTINGALAS MÁXIMO
          </span>
          <span
            class="shrink-0 rounded-full border border-bbp-border-strong bg-bbp-bg/70 px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-gray-100"
          >
            {{ operation.maxMartingales }}
          </span>
        </div>
      </div>

      <p
        v-if="cancelling"
        aria-live="polite"
        class="mt-2.5 w-full min-w-0 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5 text-center text-[0.625rem] font-semibold tracking-wider text-gray-400"
      >
        CANCELANDO OPERACIÓN…
      </p>

      <div v-if="canCancel && !cancelling" class="mt-2.5">
        <button
          v-if="!showCancelConfirm"
          type="button"
          class="w-full rounded-md border border-bbp-banker/40 bg-bbp-banker/10 px-2 py-1.5 text-[0.6875rem] font-bold tracking-wider text-bbp-banker transition-colors duration-150 hover:bg-bbp-banker/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          @click="requestCancel"
        >
          CANCELAR OPERACIÓN
        </button>

        <div
          v-else
          role="group"
          aria-label="Confirmar cancelación de operación"
          class="w-full min-w-0 rounded-md border border-bbp-border-strong bg-bbp-bg/60 p-2"
        >
          <p class="text-center text-[0.625rem] font-bold tracking-[0.1em] text-bbp-tie">
            ¿CONFIRMAR CANCELACIÓN DE OPERACIÓN?
          </p>
          <div class="mt-1.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              aria-label="Cancelar confirmación de cancelación"
              class="rounded border border-bbp-border bg-bbp-bg/40 px-2 py-1 text-[0.625rem] font-bold tracking-wider text-gray-400 transition-colors duration-150 hover:bg-bbp-bg focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
              @click="cancelConfirmPending"
            >
              NO
            </button>
            <button
              type="button"
              aria-label="Confirmar cancelación de operación"
              class="rounded border border-bbp-banker/40 bg-bbp-banker/10 px-2 py-1 text-[0.625rem] font-bold tracking-wider text-bbp-banker transition-colors duration-150 hover:bg-bbp-banker/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
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
