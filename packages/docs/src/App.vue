<script setup>
// import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex flex-col">
    <SiteHeader />
    <PLoadingBar group="website" />
    <PBacktop :visible-threshold="100" />

    <div class="md:max-w-screen-2xl relative mx-auto flex w-full max-w-full flex-1">
      <RouterView />
    </div>
  </PConfigProvider>
</template>
