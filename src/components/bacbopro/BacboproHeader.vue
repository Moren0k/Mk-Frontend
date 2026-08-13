<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import logoUrl from '@/assets/images/MKBACBO_LOGO.png'
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-bbp-border bg-bbp-bg">
    <div
      class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-4 py-3.5 sm:px-6 sm:py-4"
    >
      <div class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-bbp-border-strong sm:h-10 sm:w-10"
        >
          <img :src="logoUrl" alt="MKBACBO" class="h-full w-full object-contain p-0.5" />
        </span>
        <h1
          class="text-2xl font-black tracking-[0.3em] text-gray-100 sm:text-3xl sm:tracking-[0.35em]"
        >
          MKBACBO
        </h1>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <StatusBadge text="CASINO SYNC: ACTIVO" variant="sync" />
        <StatusBadge text="MKBOT. VIP" variant="vip" />
      </div>
    </div>
  </header>
</template>
