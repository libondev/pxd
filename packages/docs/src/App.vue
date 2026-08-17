<script setup>
// import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="min-w-0 flex w-full flex-col">
    <SiteHeader />
    <PMessage width="180" group="website" />
    <PLoadingBar group="website" />
    <PBacktop class="right-6 bottom-6 shadow-sm rounded-full" :visible-threshold="100" />

    <div
      class="md:max-w-screen-2xl min-w-0 relative mx-auto flex w-full max-w-full flex-1 bg-background-100"
    >
      <RouterView />
    </div>
  </PConfigProvider>
</template>
