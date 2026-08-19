<script setup lang="ts">
import { computed } from 'vue'

import BacboproHeader from '@/components/bacbopro/BacboproHeader.vue'
import BacboproFooter from '@/components/bacbopro/BacboproFooter.vue'
import SideNav from '@/components/tools/SideNav.vue'
import ToggleCard from '@/components/bacbopro/ToggleCard.vue'
import KpiGrid from '@/components/bacbopro/KpiGrid.vue'
import StatsSection from '@/components/bacbopro/StatsSection.vue'
import StreakBoard from '@/components/bacbopro/StreakBoard.vue'
import HistoryPanel from '@/components/bacbopro/HistoryPanel.vue'
import OperationsSection from '@/components/bacbopro/OperationsSection.vue'

import { useBacboproStore } from '@/stores/bacbopro'
import type { KpiItem } from '@/types/bacbopro'

import telegramLogo from '@/assets/images/Mk_Pruebas_Logo.webp'
import oficialLogo from '@/assets/images/Mk_Oficial_Logo.webp'

const store = useBacboproStore()

const EMPTY_KPI_ITEMS: KpiItem[] = [
  { label: 'GANADAS', value: '—', tone: 'green' },
  { label: 'ALERTAS', value: '—', tone: 'yellow' },
  { label: 'PERDIDAS', value: '—', tone: 'red' },
  { label: 'TIEMPO', value: '—', tone: 'mono' },
]

const LOADING_KPI_ITEMS: KpiItem[] = [
  { label: 'GANADAS', value: '…', tone: 'green' },
  { label: 'ALERTAS', value: '…', tone: 'yellow' },
  { label: 'PERDIDAS', value: '…', tone: 'red' },
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
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-bbp-bg font-sans text-gray-100">
    <BacboproHeader />
    <SideNav />
    <main
      class="mx-auto grid w-[90%] max-w-[1600px] flex-1 grid-cols-1 items-start gap-7 py-5 pb-7 sm:py-6 sm:pb-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-9 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
    >
      <KpiGrid class="min-w-0 lg:col-start-1 lg:row-start-1" :items="kpiItems" />
      <StatsSection
        class="min-w-0 lg:col-start-1 lg:row-start-2"
        :blocks="store.statsBlocks"
        :loading="historyLoading"
      />
      <StreakBoard
        class="min-w-0 lg:col-start-1 lg:row-start-3"
        :columns="store.streakDisplayColumns"
        :loading="historyLoading"
      />
      <aside class="min-w-0 max-w-full content-start lg:col-start-2 lg:row-start-1 lg:row-span-4">
        <div
          class="bbp-glass bbp-elevation-2 min-w-0 max-w-full overflow-hidden rounded-lg border border-bbp-border"
        >
          <div
            class="grid grid-cols-2 divide-x divide-bbp-border border-b-2 border-bbp-border-strong"
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
              embedded
              @confirm-state="confirmTelegramState"
              @confirm-strategy="confirmTelegramStrategy"
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
              embedded
              @confirm-state="confirmBacBoState"
              @confirm-strategy="confirmBacBoStrategy"
            />
          </div>
          <OperationsSection
            :oficial-operation="store.oficialOperation"
            :pruebas-operation="store.pruebasOperation"
            :oficial-loading="store.oficial.loading"
            :pruebas-loading="store.pruebas.loading"
            :oficial-cancelling="store.oficial.cancelling"
            :pruebas-cancelling="store.pruebas.cancelling"
            @cancel-oficial="store.cancelOperation('oficial')"
            @cancel-pruebas="store.cancelOperation('pruebas')"
          />
        </div>
      </aside>
      <HistoryPanel
        class="min-w-0 lg:col-start-1 lg:row-start-4"
        :grid="store.historyGrid"
        :loading="historyLoading"
      />
    </main>
    <BacboproFooter />
  </div>
</template>
