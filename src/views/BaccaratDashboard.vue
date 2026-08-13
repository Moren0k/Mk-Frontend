<script setup lang="ts">
import HeaderStatus from '@/components/dashboard/HeaderStatus.vue'
import DailySummary from '@/components/dashboard/DailySummary.vue'
import StrategiesMonitor from '@/components/dashboard/StrategiesMonitor.vue'
import StreakBoard from '@/components/dashboard/StreakBoard.vue'
import GamesGrid200 from '@/components/dashboard/GamesGrid200.vue'
import StatsBar from '@/components/dashboard/StatsBar.vue'
import CurrentOperationCard from '@/components/dashboard/CurrentOperationCard.vue'
import LastWinnerCard from '@/components/dashboard/LastWinnerCard.vue'
import DevControls from '@/components/dashboard/DevControls.vue'
</script>

<template>
  <div class="dashboard">
    <HeaderStatus />
    <main class="dashboard__body">
      <div class="dashboard__sidebar">
        <DailySummary />
        <LastWinnerCard />
      </div>
      <div class="dashboard__center">
        <StreakBoard />
        <StatsBar />
      </div>
      <div class="dashboard__right">
        <CurrentOperationCard />
        <StrategiesMonitor />
      </div>
    </main>
    <div class="dashboard__games">
      <GamesGrid200 />
    </div>
    <DevControls />
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.dashboard__body {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 16px;
  padding: 16px;
  flex: 1;
}

.dashboard__sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__center {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__games {
  padding: 0 16px 16px;
}

@media (max-width: 1024px) {
  .dashboard__body {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard__right {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .dashboard__body {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .dashboard__right {
    grid-column: auto;
    display: flex;
    flex-direction: column;
  }

  .dashboard__games {
    padding: 0 10px 10px;
  }
}

@media (min-width: 1440px) {
  .dashboard__body {
    grid-template-columns: 300px 1fr 300px;
    padding: 24px;
    gap: 20px;
  }

  .dashboard__games {
    padding: 0 24px 24px;
  }
}
</style>
