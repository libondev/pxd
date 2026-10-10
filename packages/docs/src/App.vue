<script setup>
import ArrowUpIcon from '@gdsicon/vue/arrow-up'
// import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="min-w-0 flex w-full flex-col">
    <SiteHeader />
    <PMessage width="180" group="website" />
    <PLoadingBar group="website" />
    <PBacktop class="right-6 bottom-6 shadow-lg rounded-full" :visible-threshold="100">
      <PButton size="sm" class="group px-2">
        <ArrowUpIcon class="opacity-0 group-hover:opacity-100 motion-safe:transition-opacity" />
        <PScrollProgress
          class="text-xs max-sm:hidden absolute opacity-100 group-hover:opacity-0 motion-safe:transition-opacity"
        />
      </PButton>
    </PBacktop>

    <div
      class="md:max-w-screen-2xl min-w-0 relative mx-auto flex w-full max-w-full flex-1 bg-background-100"
    >
      <RouterView />
    </div>
  </PConfigProvider>
</template>
