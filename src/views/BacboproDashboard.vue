<script setup lang="ts">
import { ref } from 'vue'

import BacboproHeader from '@/components/bacbopro/BacboproHeader.vue'
import ToggleCard from '@/components/bacbopro/ToggleCard.vue'
import KpiGrid from '@/components/bacbopro/KpiGrid.vue'
import StreakBoard from '@/components/bacbopro/StreakBoard.vue'
import HistoryPanel from '@/components/bacbopro/HistoryPanel.vue'
import LastWinnerCard from '@/components/bacbopro/LastWinnerCard.vue'
import OperationCard from '@/components/bacbopro/OperationCard.vue'

import { historyGrid, streakColumns } from '@/mocks/bacbopro/resultsData'
import { statsLast100, statsLast200 } from '@/mocks/bacbopro/historyData'
import { kpiItems } from '@/mocks/bacbopro/kpiData'
import { operationData } from '@/mocks/bacbopro/operationData'
import { lastWinnerData } from '@/mocks/bacbopro/winnerData'
import { strategyOptions } from '@/mocks/bacbopro/strategyData'

import telegramLogo from '@/assets/images/MKBACBO_PRUEBA.png'
import oficialLogo from '@/assets/images/MKBACBO_OFICIAL.png'

const telegramActive = ref(true)
const bacBoActive = ref(true)
const telegramStrategy = ref(strategyOptions[0]?.id ?? '')
const officialStrategy = ref(strategyOptions[1]?.id ?? '')

const statsBlocks = [statsLast200, statsLast100]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bbp-bg font-sans text-gray-100">
    <BacboproHeader />
    <main
      class="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 items-start gap-4 px-3 py-4 pb-6 sm:px-6 sm:py-5 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.38fr)] lg:gap-5"
    >
      <KpiGrid
        class="min-w-0 lg:col-start-1 lg:row-start-1"
        :items="kpiItems"
      />
      <StreakBoard
        class="min-w-0 lg:col-start-1 lg:row-start-2"
        :columns="streakColumns"
      />
      <aside
        class="min-w-0 max-w-full content-start lg:col-start-2 lg:row-start-1 lg:row-span-3"
      >
        <div class="min-w-0 max-w-full overflow-hidden rounded-lg border border-bbp-border bg-bbp-panel">
          <div
            class="grid grid-cols-1 divide-y divide-bbp-border border-b border-bbp-border sm:grid-cols-2 sm:divide-x sm:divide-y-0"
          >
            <ToggleCard
              v-model="telegramActive"
              v-model:strategy="telegramStrategy"
              :logo="telegramLogo"
              logo-alt="PRUEBAS TELEGRAM"
              tone="banker"
              title="PRUEBAS TELEGRAM"
              :strategy-options="strategyOptions"
              embedded
            />
            <ToggleCard
              v-model="bacBoActive"
              v-model:strategy="officialStrategy"
              :logo="oficialLogo"
              logo-alt="BAC BO OFICIAL"
              tone="player"
              title="BAC BO OFICIAL"
              :strategy-options="strategyOptions"
              embedded
            />
          </div>
          <div class="border-b border-bbp-border">
            <LastWinnerCard :winner="lastWinnerData.winner" embedded />
          </div>
          <OperationCard :operation="operationData" embedded />
        </div>
      </aside>
      <HistoryPanel
        class="min-w-0 lg:col-start-1 lg:row-start-3"
        :grid="historyGrid"
        :stats-blocks="statsBlocks"
      />
    </main>
  </div>
</template>
