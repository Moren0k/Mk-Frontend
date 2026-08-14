<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StrategyOption } from '@/types/bacbopro'
import ToggleSwitch from './ToggleSwitch.vue'
import StrategySelector from './StrategySelector.vue'

interface Props {
  logo: string
  logoAlt: string
  tone: 'banker' | 'player'
  title: string
  embedded?: boolean
  strategyOptions?: StrategyOption[]
}

const props = defineProps<Props>()

const model = defineModel<boolean>({ required: true })
const strategy = defineModel<string>('strategy', { default: '' })

const pendingEnabled = ref<boolean | null>(null)
const showToggleConfirm = ref(false)

const displayEnabled = computed(() => pendingEnabled.value ?? model.value)
const hasPendingToggleChange = computed(
  () => pendingEnabled.value !== null && pendingEnabled.value !== model.value,
)

const hexColor = computed(() => (props.tone === 'banker' ? '#E53935' : '#1E88E5'))

function enabledLabel(value: boolean): string {
  return value ? 'ON' : 'OFF'
}

function handleToggleChange(value: boolean): void {
  if (value === model.value) {
    pendingEnabled.value = null
    showToggleConfirm.value = false
    return
  }
  pendingEnabled.value = value
  showToggleConfirm.value = false
}

function requestToggleSave(): void {
  if (!hasPendingToggleChange.value) return
  showToggleConfirm.value = true
}

function cancelTogglePending(): void {
  pendingEnabled.value = null
  showToggleConfirm.value = false
}

function confirmToggleChange(): void {
  if (pendingEnabled.value === null) return
  model.value = pendingEnabled.value
  pendingEnabled.value = null
  showToggleConfirm.value = false
}
</script>

<template>
  <div
    role="group"
    :aria-label="title"
    class="flex w-full min-w-0 flex-col items-center justify-center gap-3 p-4"
    :class="
      embedded
        ? undefined
        : 'rounded-lg border border-bbp-border bg-bbp-panel'
    "
  >
    <div
      class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-bbp-border-strong bg-bbp-bg/60"
    >
      <img :src="logo" :alt="logoAlt" class="h-full w-full object-contain p-1" />
    </div>
    <span class="text-center text-base font-bold leading-snug tracking-wider text-gray-100">
      {{ title }}
    </span>
    <ToggleSwitch
      :model-value="displayEnabled"
      :active-color="hexColor"
      :label="`Activar ${title}`"
      @update:model-value="handleToggleChange"
    />

    <div
      v-if="hasPendingToggleChange && !showToggleConfirm"
      aria-live="polite"
      class="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-2.5 py-2"
    >
      <span
        class="flex items-center gap-1.5 whitespace-nowrap text-[0.625rem] font-semibold tracking-wider text-bbp-tie"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-bbp-tie" aria-hidden="true" />
        CAMBIO DE ESTADO PENDIENTE
      </span>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Guardar cambio de estado"
          class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20"
          @click="requestToggleSave"
        >
          GUARDAR
        </button>
        <button
          type="button"
          aria-label="Cancelar cambio de estado"
          class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
          @click="cancelTogglePending"
        >
          CANCELAR
        </button>
      </div>
    </div>

    <div
      v-if="hasPendingToggleChange && showToggleConfirm"
      role="group"
      aria-label="Panel de confirmación de cambio de estado"
      class="w-full min-w-0 rounded-md border border-bbp-border-strong bg-bbp-bg/60 p-3"
    >
      <p class="text-center text-[0.6875rem] font-bold tracking-[0.15em] text-bbp-tie">
        ¿CONFIRMAR CAMBIO DE ESTADO?
      </p>
      <p class="mt-1 text-center text-xs font-semibold text-gray-300">
        {{ title }}
      </p>
      <p class="mt-0.5 text-center text-xs font-semibold text-gray-300">
        {{ enabledLabel(model) }} → {{ enabledLabel(pendingEnabled ?? model) }}
      </p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-label="Cancelar confirmación de estado"
          class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
          @click="cancelTogglePending"
        >
          CANCELAR
        </button>
        <button
          type="button"
          aria-label="Confirmar cambio de estado"
          class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20"
          @click="confirmToggleChange"
        >
          CONFIRMAR
        </button>
      </div>
    </div>

    <StrategySelector
      v-if="strategyOptions?.length"
      v-model="strategy"
      :options="strategyOptions"
      :select-label="`Seleccionar estrategia de ${title}`"
      embedded
      compact
    />
  </div>
</template>
