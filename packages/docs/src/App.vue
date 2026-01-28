<script setup>
// import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex size-full flex-col">
    <PPlaceholder invert class="h-full" color="var(--color-gray-alpha-100)">
      <SiteHeader />
      <PMessage width="180" />
      <PLoadingBar group="website" />
      <PBacktop :visible-threshold="100" />

      <div class="md:max-w-screen-2xl relative mx-auto flex w-full max-w-full flex-1 bg-background-100">
        <RouterView />
      </div>
    </PPlaceholder>
  </PConfigProvider>
</template>
