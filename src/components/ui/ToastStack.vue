<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { ToastVariant } from '@/stores/notifications'

const store = useNotificationsStore()

const toneClasses: Record<ToastVariant, string> = {
  error: 'border-bbp-banker/40 text-bbp-banker',
  warning: 'border-bbp-tie/40 text-bbp-tie',
  info: 'border-bbp-player/40 text-bbp-player',
  success: 'border-bbp-active/40 text-bbp-active',
}

const iconFor: Record<ToastVariant, 'error' | 'warning' | 'info' | 'success'> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'success',
}
</script>

<template>
  <Teleport to="body">
    <div
      aria-live="polite"
      class="pointer-events-none fixed bottom-3 left-3 z-[70] flex w-[calc(100%-1.5rem)] max-w-xs flex-col gap-2 sm:bottom-4 sm:left-4"
    >
      <TransitionGroup name="bbp-toast">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="bbp-glass bbp-elevation-2 animate-toast-in pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2.5"
          :class="toneClasses[toast.variant]"
        >
          <AppIcon :name="iconFor[toast.variant]" :size="16" class="mt-0.5" />
          <p class="min-w-0 flex-1 text-xs font-medium leading-snug text-gray-200">
            {{ toast.message }}
          </p>
          <button
            type="button"
            aria-label="Cerrar notificación"
            class="shrink-0 rounded p-0.5 text-gray-500 transition-colors duration-150 hover:text-gray-200 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
            @click="store.dismissToast(toast.id)"
          >
            <AppIcon name="close" :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.bbp-toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  position: absolute;
}

.bbp-toast-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.bbp-toast-move {
  transition: transform 0.2s ease;
}
</style>
