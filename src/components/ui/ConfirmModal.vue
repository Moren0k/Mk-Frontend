<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  title: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'active' | 'banker'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  tone: 'active',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const cancelButton = ref<HTMLButtonElement | null>(null)

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && !props.loading) emit('cancel')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  cancelButton.value?.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const toneClasses = {
  active: 'border-bbp-active/40 bg-bbp-active/10 text-bbp-active hover:bg-bbp-active/20',
  banker: 'border-bbp-banker/40 bg-bbp-banker/10 text-bbp-banker hover:bg-bbp-banker/20',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @mousedown.self="!loading && emit('cancel')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="bbp-glass bbp-elevation-2 animate-modal-in w-full max-w-sm rounded-lg p-5"
      >
      <p class="text-center text-sm font-bold tracking-[0.1em] text-gray-100">
        {{ title }}
      </p>
      <div class="mt-2 text-center text-xs font-medium text-gray-300">
        <slot />
      </div>
      <div class="mt-4 grid grid-cols-2 gap-2.5">
        <button
          ref="cancelButton"
          type="button"
          :disabled="loading"
          class="rounded-md border border-bbp-border bg-bbp-bg/40 px-3.5 py-2.5 text-xs font-bold tracking-wider text-gray-300 transition-colors duration-150 hover:bg-bbp-bg focus-visible:ring-2 focus-visible:ring-bbp-focus/50 disabled:opacity-60"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded-md border px-3.5 py-2.5 text-xs font-bold tracking-wider transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50 disabled:opacity-60"
          :class="toneClasses[tone]"
          @click="emit('confirm')"
        >
          {{ loading ? 'Aplicando…' : confirmLabel }}
        </button>
      </div>
      </div>
    </div>
  </Teleport>
</template>
