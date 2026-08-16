<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { StrategyOption } from '@/types/bacbopro'
import ToggleSwitch from './ToggleSwitch.vue'
import StrategySelector from './StrategySelector.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

interface Props {
  logo: string
  logoAlt: string
  tone: 'banker' | 'player'
  title: string
  active: boolean
  strategyId: string
  embedded?: boolean
  strategyOptions?: StrategyOption[]
  patching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  strategyOptions: () => [],
  patching: false,
})

const emit = defineEmits<{
  confirmState: [value: boolean]
  confirmStrategy: [id: string]
}>()

const pendingEnabled = ref<boolean | null>(null)
const showModal = ref(false)

const displayEnabled = computed(() => pendingEnabled.value ?? props.active)

const hexColor = computed(() =>
  props.tone === 'banker' ? 'var(--color-bbp-banker)' : 'var(--color-bbp-player)',
)

function enabledLabel(value: boolean): string {
  return value ? 'ON' : 'OFF'
}

function handleToggleChange(value: boolean): void {
  if (value === props.active) return
  pendingEnabled.value = value
  showModal.value = true
}

function cancelToggle(): void {
  pendingEnabled.value = null
  showModal.value = false
}

function confirmToggle(): void {
  if (pendingEnabled.value === null) return
  emit('confirmState', pendingEnabled.value)
}

watch(
  () => props.patching,
  (patching, wasPatching) => {
    if (wasPatching && !patching) {
      showModal.value = false
      pendingEnabled.value = null
    }
  },
)
</script>

<template>
  <div
    role="group"
    :aria-label="title"
    class="flex w-full min-w-0 flex-col items-center justify-center gap-2 p-3 sm:p-3.5"
    :class="embedded ? undefined : 'rounded-lg border border-bbp-border bg-bbp-panel bbp-elevation-1'"
  >
    <div
      class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-bbp-border-strong bg-bbp-bg/60"
    >
      <img :src="logo" :alt="logoAlt" class="h-full w-full object-contain p-0.5" />
    </div>
    <span class="font-brand text-center text-sm leading-[1.3] tracking-[-0.01em] text-gray-100">
      {{ title }}
    </span>
    <ToggleSwitch
      :model-value="displayEnabled"
      :active-color="hexColor"
      :label="`Activar ${title}`"
      :disabled="patching"
      @update:model-value="handleToggleChange"
    />

    <p
      v-if="patching && !showModal"
      aria-live="polite"
      class="w-full min-w-0 rounded-md border border-bbp-border bg-bbp-bg/60 px-2 py-1.5 text-center text-[0.625rem] font-semibold tracking-wider text-gray-400"
    >
      APLICANDO CAMBIO…
    </p>

    <StrategySelector
      v-if="strategyOptions?.length"
      :model-value="strategyId"
      :options="strategyOptions"
      :select-label="`Seleccionar estrategia de ${title}`"
      :patching="patching"
      embedded
      compact
      @confirm="emit('confirmStrategy', $event)"
    />

    <ConfirmModal
      v-if="showModal"
      :title="`¿${enabledLabel(pendingEnabled ?? active)} ${title}?`"
      :tone="pendingEnabled ? 'active' : 'banker'"
      :confirm-label="`Sí, ${enabledLabel(pendingEnabled ?? active)}`"
      :loading="patching"
      @confirm="confirmToggle"
      @cancel="cancelToggle"
    >
      Vas a cambiar el estado de este canal de
      <strong class="text-gray-100">{{ enabledLabel(active) }}</strong>
      a
      <strong class="text-gray-100">{{ enabledLabel(pendingEnabled ?? active) }}</strong>.
    </ConfirmModal>
  </div>
</template>
