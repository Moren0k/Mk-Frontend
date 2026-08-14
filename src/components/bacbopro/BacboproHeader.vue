<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import logoUrl from '@/assets/images/MKBACBO_LOGO.png'
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-bbp-border bg-bbp-bg">
    <div
      class="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-3 py-3.5 max-[400px]:gap-x-3 sm:px-6 sm:py-4"
    >
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-bbp-border-strong sm:h-10 sm:w-10"
        >
          <img :src="logoUrl" alt="MKBACBO" class="h-full w-full object-contain p-0.5" />
        </span>
        <h1
          class="text-xl font-black tracking-[0.3em] text-gray-100 max-[400px]:text-lg max-[400px]:tracking-[0.2em] sm:text-2xl sm:tracking-[0.35em] lg:text-3xl"
        >
          MKBACBO
        </h1>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <StatusBadge text="CASINO SYNC: ACTIVO" variant="sync" />
        <StatusBadge text="MKBOT. VIP" variant="vip" />
      </div>
    </div>
  </header>
</template>
