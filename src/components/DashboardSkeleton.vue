<template>
  <div class="flex min-h-screen flex-col items-center bg-bbp-bg" aria-hidden="true">
    <div class="h-[4.25rem] w-full border-b border-bbp-border bg-bbp-bg sm:h-[4.75rem]" />

    <main
      class="mx-auto grid w-[90%] max-w-[1600px] flex-1 grid-cols-1 items-start gap-7 py-5 pb-7 sm:py-6 sm:pb-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-9 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
    >
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 lg:col-start-1 lg:row-start-1">
        <div
          v-for="n in 4"
          :key="n"
          class="h-20 animate-pulse rounded-lg border border-bbp-border bg-bbp-panel"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:col-start-1 lg:row-start-2">
        <div
          v-for="n in 2"
          :key="n"
          class="h-32 animate-pulse rounded-lg border border-bbp-border bg-bbp-panel"
        />
      </div>

      <div
        class="h-44 animate-pulse rounded-lg border border-bbp-border bg-bbp-panel lg:col-start-1 lg:row-start-3"
      />

      <aside
        class="h-[28rem] animate-pulse rounded-lg border border-bbp-border bg-bbp-panel lg:col-start-2 lg:row-start-1 lg:row-span-4"
      />

      <div
        class="h-56 animate-pulse rounded-lg border border-bbp-border bg-bbp-panel lg:col-start-1 lg:row-start-4"
      />
    </main>
  </div>
</template>
