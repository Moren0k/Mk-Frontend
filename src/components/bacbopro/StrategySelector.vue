<script setup lang="ts">
import { ref, watch } from 'vue'
import type { StrategyOption } from '@/types/bacbopro'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

interface Props {
  options: StrategyOption[]
  modelValue: string
  label?: string
  embedded?: boolean
  compact?: boolean
  selectLabel?: string
  patching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'ESTRATEGIA',
  embedded: false,
  compact: false,
  selectLabel: 'Seleccionar estrategia',
  patching: false,
})

const emit = defineEmits<{
  confirm: [id: string]
}>()

const pending = ref<string | null>(null)
const showModal = ref(false)

function optionLabel(id: string): string {
  return props.options.find((option) => option.id === id)?.label ?? id
}

function handleSelectChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  if (value === props.modelValue) return
  pending.value = value
  showModal.value = true
}

function cancelChange(): void {
  pending.value = null
  showModal.value = false
}

function confirmChange(): void {
  if (pending.value === null) return
  emit('confirm', pending.value)
}

watch(
  () => props.patching,
  (patching, wasPatching) => {
    if (wasPatching && !patching) {
      showModal.value = false
      pending.value = null
    }
  },
)
</script>

<template>
  <section
    aria-label="Selector de estrategia"
    class="mx-auto w-full max-w-[7rem] min-w-0"
    :class="embedded ? undefined : 'max-w-full rounded-lg border border-bbp-border bg-bbp-panel bbp-elevation-1 p-4'"
  >
    <h2
      class="text-center font-bold tracking-[0.15em] text-gray-300"
      :class="compact ? 'text-xs' : 'text-lg'"
    >
      {{ label }}
    </h2>

    <div class="relative mt-1.5 w-full min-w-0">
      <select
        :value="pending ?? modelValue"
        :aria-label="selectLabel"
        :disabled="patching || options.length === 0"
        class="w-full min-w-0 appearance-none rounded-md border border-bbp-border-strong bg-bbp-bg/80 px-2 py-1 pr-6 text-[0.6875rem] font-semibold tracking-wider text-gray-100 outline-none transition-colors duration-150 focus-visible:border-bbp-focus focus-visible:ring-2 focus-visible:ring-bbp-focus/40 disabled:opacity-60"
        @change="handleSelectChange"
      >
        <option v-if="options.length === 0" value="" class="bg-bbp-panel text-gray-100">
          CARGANDO…
        </option>
        <option v-for="option in options" :key="option.id" :value="option.id" class="bg-bbp-panel text-gray-100">
          {{ option.label }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-gray-400"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>

    <p
      v-if="patching && !showModal"
      aria-live="polite"
      class="mt-1.5 w-full min-w-0 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5 text-center text-[0.625rem] font-semibold tracking-wider text-gray-400"
    >
      APLICANDO CAMBIO…
    </p>

    <ConfirmModal
      v-if="showModal"
      title="¿Cambiar estrategia?"
      tone="active"
      confirm-label="Sí, cambiar"
      :loading="patching"
      @confirm="confirmChange"
      @cancel="cancelChange"
    >
      <strong class="text-gray-100">{{ optionLabel(modelValue) }}</strong>
      →
      <strong class="text-gray-100">{{ optionLabel(pending ?? modelValue) }}</strong>
    </ConfirmModal>
  </section>
</template>
