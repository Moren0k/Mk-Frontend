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

import telegramLogo from '@/assets/images/MKBACBO_PRUEBA.png'
import oficialLogo from '@/assets/images/MKBACBO_OFICIAL.png'

const telegramActive = ref(true)
const bacBoActive = ref(true)

const statsBlocks = [statsLast200, statsLast100]
</script>

<template>
  <div class="min-h-screen bg-bbp-bg font-sans text-gray-100">
    <BacboproHeader />
    <div
      class="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(270px,1fr)] lg:gap-5"
    >
      <main class="flex flex-col content-start gap-4">
        <KpiGrid :items="kpiItems" />
        <StreakBoard :columns="streakColumns" />
        <HistoryPanel :grid="historyGrid" :stats-blocks="statsBlocks" />
      </main>
      <aside class="content-start">
        <div class="overflow-hidden rounded-lg border border-bbp-border bg-bbp-panel">
          <div class="grid grid-cols-2 divide-x divide-bbp-border border-b border-bbp-border">
            <ToggleCard
              v-model="telegramActive"
              :logo="telegramLogo"
              logo-alt="PRUEBAS TELEGRAM"
              tone="banker"
              title="PRUEBAS TELEGRAM"
              embedded
            />
            <ToggleCard
              v-model="bacBoActive"
              :logo="oficialLogo"
              logo-alt="BAC BO OFICIAL"
              tone="player"
              title="BAC BO OFICIAL"
              embedded
            />
          </div>
          <div class="border-b border-bbp-border">
            <LastWinnerCard :winner="lastWinnerData.winner" embedded />
          </div>
          <OperationCard :operation="operationData" embedded />
        </div>
      </aside>
    </div>
  </div>
</template>
