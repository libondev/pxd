<script setup>
// import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex w-full flex-col">
    <PPlaceholder invert class="h-full bg-fixed" color="var(--color-gray-alpha-100)">
      <SiteHeader />
      <PMessage width="180" group="website" />
      <PLoadingBar group="website" />
      <PBacktop class="right-6 bottom-6 shadow-sm rounded-full" :visible-threshold="100" />

      <div
        class="md:max-w-screen-2xl relative mx-auto flex w-full max-w-full flex-1 bg-background-100"
      >
        <RouterView />
      </div>
    </PPlaceholder>
  </PConfigProvider>
</template>
