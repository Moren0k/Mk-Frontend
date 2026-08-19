<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { IconName } from '@/components/icons/AppIcon.vue'
import StatusBadge from '@/components/bacbopro/StatusBadge.vue'
import { TOOLS } from '@/config/tools'
import { useSideNav } from '@/composables/useSideNav'
import { useAccessGate } from '@/composables/useAccessGate'
import { useBacboproStore } from '@/stores/bacbopro'

interface NavEntry {
  id: string
  label: string
  to: string
  icon: IconName
}

const NAV_ENTRIES: NavEntry[] = [{ id: 'panel', label: 'Panel', to: '/', icon: 'home' }, ...TOOLS]

const route = useRoute()
const { isOpen, close } = useSideNav()
const { lock } = useAccessGate()
const store = useBacboproStore()

const syncActive = computed(
  () => store.streamConnected && store.health?.collectorConnected !== false,
)
const syncText = computed(() =>
  syncActive.value ? 'CASINO EN VIVO: ACTIVO' : 'CASINO EN VIVO: DESCONECTADO',
)

const showReportConfirm = ref(false)

function requestReport(): void {
  showReportConfirm.value = true
}

function cancelReportConfirm(): void {
  showReportConfirm.value = false
}

async function confirmReport(): Promise<void> {
  showReportConfirm.value = false
  await store.sendReport()
}

function handleLogout(): void {
  close()
  lock()
}
</script>

<template>
  <Transition name="bbp-drawer-backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
      aria-hidden="true"
      @click="close"
    />
  </Transition>

  <Transition name="bbp-drawer">
    <nav
      v-if="isOpen"
      aria-label="Navegación secundaria"
      class="bbp-glass bbp-elevation-2 fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col overflow-hidden border-r border-bbp-border"
    >
      <div class="flex shrink-0 items-center justify-between border-b border-bbp-border px-4 py-4">
        <span class="text-xs font-bold tracking-[0.15em] text-gray-400">MENÚ</span>
        <button
          type="button"
          title="Cerrar menú"
          aria-label="Cerrar menú"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-bbp-border text-gray-400 transition-colors duration-150 hover:border-bbp-border-strong hover:text-gray-100 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          @click="close"
        >
          <AppIcon name="close" :size="14" />
        </button>
      </div>

      <div class="shrink-0 px-4 py-4">
        <StatusBadge :text="syncText" :active="syncActive" />
      </div>

      <div class="flex flex-col gap-1.5 px-3" role="group" aria-label="Secciones">
        <RouterLink
          v-for="entry in NAV_ENTRIES"
          :key="entry.id"
          :to="entry.to"
          class="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold tracking-wider transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          :class="
            route.path === entry.to
              ? 'border-bbp-active/40 bg-bbp-active/10 text-bbp-active'
              : 'border-bbp-border text-gray-400 hover:border-bbp-border-strong hover:text-gray-100'
          "
          @click="close"
        >
          <AppIcon :name="entry.icon" :size="15" />
          {{ entry.label }}
        </RouterLink>
      </div>

      <div
        class="relative mt-auto flex shrink-0 flex-col gap-2 border-t border-bbp-border px-3 py-3"
      >
        <button
          v-if="!showReportConfirm"
          type="button"
          :disabled="store.sendingReport"
          class="inline-flex items-center gap-2 rounded-md border border-bbp-tie/40 bg-bbp-tie/10 px-3 py-2 text-xs font-bold tracking-wider text-bbp-tie transition-colors duration-150 hover:bg-bbp-tie/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50 disabled:opacity-60"
          @click="requestReport"
        >
          <AppIcon name="send" :size="14" />
          {{ store.sendingReport ? 'ENVIANDO…' : 'ENVIAR RESUMEN' }}
        </button>
        <div
          v-else
          role="group"
          aria-label="Confirmar envío de resumen"
          class="rounded-md border border-bbp-border-strong bg-bbp-bg/60 p-2.5"
        >
          <span class="block text-center text-xs font-bold tracking-[0.1em] text-bbp-tie">
            ¿ENVIAR RESUMEN A TELEGRAM?
          </span>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded border border-bbp-border bg-bbp-bg/40 px-3 py-1.5 text-xs font-bold tracking-wider text-gray-400 transition-colors duration-150 hover:bg-bbp-bg focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
              @click="cancelReportConfirm"
            >
              NO
            </button>
            <button
              type="button"
              class="rounded border border-bbp-active/40 bg-bbp-active/10 px-3 py-1.5 text-xs font-bold tracking-wider text-bbp-active transition-colors duration-150 hover:bg-bbp-active/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
              @click="confirmReport"
            >
              SÍ
            </button>
          </div>
        </div>

        <button
          type="button"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          class="inline-flex items-center gap-2 rounded-md border border-bbp-border px-3 py-2 text-xs font-bold tracking-wider text-gray-400 transition-colors duration-150 hover:border-bbp-border-strong hover:text-gray-100 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          @click="handleLogout"
        >
          <AppIcon name="logout" :size="16" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  </Transition>
</template>

<style scoped>
.bbp-drawer-enter-active,
.bbp-drawer-leave-active {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.bbp-drawer-enter-from,
.bbp-drawer-leave-to {
  transform: translateX(-100%);
}

.bbp-drawer-backdrop-enter-active,
.bbp-drawer-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.bbp-drawer-backdrop-enter-from,
.bbp-drawer-backdrop-leave-to {
  opacity: 0;
}
</style>
