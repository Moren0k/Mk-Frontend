<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import AccessGate from '@/components/AccessGate.vue'
import DashboardSkeleton from '@/components/DashboardSkeleton.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import { useAccessGate } from '@/composables/useAccessGate'
import { useBacboproStore } from '@/stores/bacbopro'

const { isUnlocked } = useAccessGate()
const store = useBacboproStore()

const MIN_REVEAL_HOLD_MS = 350
const MAX_REVEAL_MS = 1400

const revealing = ref(false)
let holdTimer: ReturnType<typeof setTimeout> | null = null
let capTimer: ReturnType<typeof setTimeout> | null = null
let unlockedAt = 0

function clearTimers(): void {
  if (holdTimer) clearTimeout(holdTimer)
  if (capTimer) clearTimeout(capTimer)
  holdTimer = null
  capTimer = null
}

watch(isUnlocked, (unlocked) => {
  clearTimers()
  if (!unlocked) {
    revealing.value = false
    return
  }
  revealing.value = true
  unlockedAt = Date.now()
  capTimer = setTimeout(() => {
    revealing.value = false
  }, MAX_REVEAL_MS)
})

watch(
  () => store.hydrated,
  (done) => {
    if (!done || !revealing.value) return
    const remaining = Math.max(MIN_REVEAL_HOLD_MS - (Date.now() - unlockedAt), 0)
    holdTimer = setTimeout(() => {
      revealing.value = false
    }, remaining)
  },
)

onUnmounted(clearTimers)
</script>

<template>
  <div class="relative min-h-screen">
    <RouterView v-if="isUnlocked" />
    <DashboardSkeleton v-else />

    <Transition name="bbp-gate">
      <AccessGate v-if="!isUnlocked || revealing" :revealing="revealing" />
    </Transition>

    <template v-if="isUnlocked">
      <ToastStack />
    </template>
  </div>
</template>

<style scoped>
.bbp-gate-enter-active,
.bbp-gate-leave-active {
  transition: opacity 0.4s ease;
}

.bbp-gate-enter-from,
.bbp-gate-leave-to {
  opacity: 0;
}
</style>
