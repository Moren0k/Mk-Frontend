<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StrategyOption } from '@/types/bacbopro'

interface Props {
  options: StrategyOption[]
  label?: string
  embedded?: boolean
  compact?: boolean
  selectLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'ESTRATEGIA',
  embedded: false,
  compact: false,
  selectLabel: 'Seleccionar estrategia',
})

const model = defineModel<string>({ required: true })

const pending = ref<string | null>(null)
const showConfirm = ref(false)

const selectValue = computed(() => pending.value ?? model.value)
const hasPendingChange = computed(() => pending.value !== null && pending.value !== model.value)

function optionLabel(id: string): string {
  return props.options.find((option) => option.id === id)?.label ?? id
}

function handleSelectChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  if (value === model.value) {
    pending.value = null
    showConfirm.value = false
    return
  }
  pending.value = value
  showConfirm.value = false
}

function requestSave(): void {
  if (!hasPendingChange.value) return
  showConfirm.value = true
}

function cancelPending(): void {
  pending.value = null
  showConfirm.value = false
}

function confirmChange(): void {
  if (pending.value === null) return
  model.value = pending.value
  pending.value = null
  showConfirm.value = false
}
</script>

<template>
  <section
    aria-label="Selector de estrategia"
    class="w-full min-w-0 max-w-full"
    :class="embedded ? undefined : 'rounded-lg border border-bbp-border bg-bbp-panel p-4'"
  >
    <h2
      class="text-center font-bold tracking-[0.15em] text-gray-300"
      :class="compact ? 'text-sm' : 'text-lg'"
    >
      {{ label }}
    </h2>

    <div class="relative mt-2 w-full min-w-0 max-w-full">
      <select
        :value="selectValue"
        :aria-label="selectLabel"
        class="w-full min-w-0 max-w-full appearance-none rounded-md border border-bbp-border-strong bg-bbp-bg/80 px-3 py-2 pr-9 text-sm font-semibold tracking-wider text-gray-100 outline-none transition-colors duration-200 focus:border-bbp-active/60 focus:ring-1 focus:ring-bbp-active/40"
        @change="handleSelectChange"
      >
        <option
          v-for="option in options"
          :key="option.id"
          :value="option.id"
          class="bg-bbp-panel text-gray-100"
        >
          {{ option.label }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>

    <div
      v-if="hasPendingChange && !showConfirm"
      aria-live="polite"
      class="mt-2 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-2.5 py-2"
    >
      <span
        class="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold tracking-wider text-bbp-tie"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-bbp-tie" aria-hidden="true" />
        CAMBIO PENDIENTE
      </span>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20"
          @click="requestSave"
        >
          GUARDAR
        </button>
        <button
          type="button"
          class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[11px] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
          @click="cancelPending"
        >
          CANCELAR
        </button>
      </div>
    </div>

    <div
      v-if="hasPendingChange && showConfirm"
      role="group"
      aria-label="Confirmar cambio de estrategia"
      class="mt-2 w-full min-w-0 rounded-md border border-bbp-border-strong bg-bbp-bg/60 p-3"
    >
      <p class="text-center text-[11px] font-bold tracking-[0.15em] text-bbp-tie">
        ¿CONFIRMAR CAMBIO DE ESTRATEGIA?
      </p>
      <p class="mt-1 text-center text-xs font-semibold text-gray-300">
        {{ optionLabel(model) }} → {{ optionLabel(pending ?? model) }}
      </p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded border border-bbp-border bg-bbp-bg/40 px-2.5 py-1 text-[11px] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
          @click="cancelPending"
        >
          CANCELAR
        </button>
        <button
          type="button"
          class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20"
          @click="confirmChange"
        >
          CONFIRMAR
        </button>
      </div>
    </div>
  </section>
</template>
