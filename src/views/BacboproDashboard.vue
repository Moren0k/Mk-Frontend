<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

import BacboproHeader from '@/components/bacbopro/BacboproHeader.vue'
import ToggleCard from '@/components/bacbopro/ToggleCard.vue'
import KpiGrid from '@/components/bacbopro/KpiGrid.vue'
import StatsSection from '@/components/bacbopro/StatsSection.vue'
import StreakBoard from '@/components/bacbopro/StreakBoard.vue'
import HistoryPanel from '@/components/bacbopro/HistoryPanel.vue'
import LastWinnerCard from '@/components/bacbopro/LastWinnerCard.vue'
import OperationCard from '@/components/bacbopro/OperationCard.vue'

import { useBacboproStore } from '@/stores/bacbopro'
import type { KpiItem } from '@/types/bacbopro'

import telegramLogo from '@/assets/images/MKBACBO_PRUEBA.png'
import oficialLogo from '@/assets/images/MKBACBO_OFICIAL.png'

const store = useBacboproStore()

const EMPTY_KPI_ITEMS: KpiItem[] = [
  { label: 'WINS', value: '—', tone: 'green' },
  { label: 'ALERTAS ENVIADAS', value: '—', tone: 'yellow' },
  { label: 'LOST', value: '—', tone: 'red' },
  { label: 'TIEMPO', value: '—', tone: 'mono' },
]

const LOADING_KPI_ITEMS: KpiItem[] = [
  { label: 'WINS', value: '…', tone: 'green' },
  { label: 'ALERTAS ENVIADAS', value: '…', tone: 'yellow' },
  { label: 'LOST', value: '…', tone: 'red' },
  { label: 'TIEMPO', value: '…', tone: 'mono' },
]

const kpiItems = computed<KpiItem[]>(() => {
  if (store.summary) return store.kpiItems
  return store.summaryLoading ? LOADING_KPI_ITEMS : EMPTY_KPI_ITEMS
})

const telegramActive = computed(() => store.pruebas.config?.active ?? false)
const telegramStrategyId = computed(() => store.pruebas.config?.strategyId ?? '')
const bacBoActive = computed(() => store.oficial.config?.active ?? false)
const bacBoStrategyId = computed(() => store.oficial.config?.strategyId ?? '')

const historyLoading = computed(() => store.historyLoading && store.history.length === 0)

function confirmTelegramState(value: boolean): void {
  void store.applyChannelPatch('pruebas', { active: value })
}

function confirmTelegramStrategy(id: string): void {
  void store.applyChannelPatch('pruebas', { strategyId: id })
}

function confirmBacBoState(value: boolean): void {
  void store.applyChannelPatch('oficial', { active: value })
}

function confirmBacBoStrategy(id: string): void {
  void store.applyChannelPatch('oficial', { strategyId: id })
}

onMounted(() => {
  void store.initialize()
})

onUnmounted(() => {
  store.dispose()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bbp-bg font-sans text-gray-100">
    <BacboproHeader />
    <main
      class="mx-auto grid w-full flex-1 grid-cols-1 items-start gap-4 py-4 pb-6 sm:py-5 sm:pb-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5"
    >
      <KpiGrid
        class="min-w-0 lg:col-start-1 lg:row-start-1"
        :items="kpiItems"
      />
      <StatsSection
        class="min-w-0 lg:col-start-1 lg:row-start-2"
        :blocks="store.statsBlocks"
        :loading="historyLoading"
      />
      <StreakBoard
        class="min-w-0 lg:col-start-1 lg:row-start-3"
        :columns="store.streakColumns"
        :loading="historyLoading"
      />
      <aside
        class="min-w-0 max-w-full content-start lg:col-start-2 lg:row-start-1 lg:row-span-4"
      >
        <div class="min-w-0 max-w-full overflow-hidden rounded-lg border border-bbp-border bg-bbp-panel">
          <div
            class="grid grid-cols-1 divide-y divide-bbp-border border-b border-bbp-border sm:grid-cols-2 sm:divide-x sm:divide-y-0"
          >
            <ToggleCard
              :logo="telegramLogo"
              logo-alt="PRUEBAS TELEGRAM"
              tone="banker"
              title="PRUEBAS TELEGRAM"
              :active="telegramActive"
              :strategy-id="telegramStrategyId"
              :strategy-options="store.strategyOptions"
              :patching="store.pruebas.patching"
              :patch-error="store.pruebas.patchError"
              embedded
              @confirm-state="confirmTelegramState"
              @confirm-strategy="confirmTelegramStrategy"
              @dismiss-error="store.clearPatchError('pruebas')"
            />
            <ToggleCard
              :logo="oficialLogo"
              logo-alt="BAC BO OFICIAL"
              tone="player"
              title="BAC BO OFICIAL"
              :active="bacBoActive"
              :strategy-id="bacBoStrategyId"
              :strategy-options="store.strategyOptions"
              :patching="store.oficial.patching"
              :patch-error="store.oficial.patchError"
              embedded
              @confirm-state="confirmBacBoState"
              @confirm-strategy="confirmBacBoStrategy"
              @dismiss-error="store.clearPatchError('oficial')"
            />
          </div>
          <div class="border-b border-bbp-border">
            <LastWinnerCard
              :winner="store.lastWinner"
              :loading="historyLoading"
              embedded
            />
          </div>
          <div class="border-b border-bbp-border">
            <OperationCard
              :operation="store.oficialOperation"
              channel-label="BAC BO OFICIAL"
              :loading="store.oficial.loading"
              :cancelling="store.oficial.cancelling"
              :cancel-error="store.oficial.cancelError"
              embedded
              @cancel="store.cancelOperation('oficial')"
              @dismiss-error="store.clearCancelError('oficial')"
            />
          </div>
          <OperationCard
            :operation="store.pruebasOperation"
            channel-label="PRUEBAS TELEGRAM"
            :loading="store.pruebas.loading"
            :cancelling="store.pruebas.cancelling"
            :cancel-error="store.pruebas.cancelError"
            embedded
            @cancel="store.cancelOperation('pruebas')"
            @dismiss-error="store.clearCancelError('pruebas')"
          />
        </div>
      </aside>
      <HistoryPanel
        class="min-w-0 lg:col-start-1 lg:row-start-4"
        :grid="store.historyGrid"
        :loading="historyLoading"
      />
    </main>
  </div>
</template>
