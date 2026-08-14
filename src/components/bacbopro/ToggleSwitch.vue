<script setup lang="ts">
interface Props {
  activeColor: string
  label?: string
}

const props = defineProps<Props>()

const model = defineModel<boolean>({ required: true })

function toggle(): void {
  model.value = !model.value
}

const switchLabel = props.label ?? 'Interruptor'
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="switchLabel"
    class="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    :style="{ backgroundColor: model ? activeColor : '#2A3040' }"
    @click="toggle"
  >
    <span
      class="inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200"
      :class="model ? 'translate-x-[1.8125rem]' : 'translate-x-[0.1875rem]'"
      aria-hidden="true"
    />
  </button>
</template>
