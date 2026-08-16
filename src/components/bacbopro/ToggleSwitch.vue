<script setup lang="ts">
interface Props {
  activeColor: string
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Interruptor',
  disabled: false,
})

const model = defineModel<boolean>({ required: true })

function toggle(): void {
  if (props.disabled) return
  model.value = !model.value
}

const switchLabel = props.label
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="switchLabel"
    :disabled="disabled"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bbp-focus/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bbp-bg disabled:opacity-60"
    :style="{
      backgroundColor: model ? activeColor : 'var(--color-bbp-border-strong)',
      boxShadow: model
        ? `0 0 8px color-mix(in srgb, ${activeColor} 45%, transparent)`
        : 'none',
    }"
    @click="toggle"
  >
    <span
      class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
      :class="model ? 'translate-x-[1.375rem]' : 'translate-x-[0.125rem]'"
      aria-hidden="true"
    />
  </button>
</template>
