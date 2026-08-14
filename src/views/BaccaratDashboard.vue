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
  min-height: 100dvh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.dashboard__body {
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.5fr) minmax(0, 0.75fr);
  gap: 1rem;
  padding: 1rem;
  flex: 1;
}

.dashboard__sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.dashboard__center {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.dashboard__right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.dashboard__games {
  padding: 0 1rem 1rem;
}

@media (max-width: 1200px) {
  .dashboard__body {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard__right {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .dashboard__body {
    grid-template-columns: 1fr;
    gap: 0.625rem;
    padding: 0.625rem;
  }

  .dashboard__right {
    grid-column: auto;
    display: flex;
    flex-direction: column;
  }

  .dashboard__games {
    padding: 0 0.625rem 0.625rem;
  }
}

@media (max-width: 480px) {
  .dashboard__body {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .dashboard__games {
    padding: 0 0.5rem 0.5rem;
  }
}
</style>
