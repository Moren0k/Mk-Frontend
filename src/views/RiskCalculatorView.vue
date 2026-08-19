<script setup lang="ts">
import BacboproHeader from '@/components/bacbopro/BacboproHeader.vue'
import BacboproFooter from '@/components/bacbopro/BacboproFooter.vue'
import SideNav from '@/components/tools/SideNav.vue'
import RiskCalculatorTool from '@/components/tools/RiskCalculatorTool.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-bbp-bg font-sans text-gray-100">
    <BacboproHeader />
    <SideNav />
    <main
      class="mx-auto w-[90%] max-w-[1600px] flex-1 py-5 pb-7 sm:py-6 sm:pb-9 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
    >
      <RiskCalculatorTool />
    </main>
    <BacboproFooter />
  </div>
</template>
