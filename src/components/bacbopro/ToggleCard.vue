<script setup lang="ts">
import { computed } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'

interface Props {
  logo: string
  logoAlt: string
  tone: 'banker' | 'player'
  title: string
  embedded?: boolean
}

const props = defineProps<Props>()

const model = defineModel<boolean>({ required: true })

const hexColor = computed(() => (props.tone === 'banker' ? '#E53935' : '#1E88E5'))
</script>

<template>
  <div
    class="flex h-full flex-col items-center justify-center gap-3 p-4"
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
    <ToggleSwitch v-model="model" :active-color="hexColor" :label="`Activar ${title}`" />
  </div>
</template>
