<script setup>
// import zhCN from 'pxd/locales/zh-CN'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex flex-col">
    <SiteHeader />

    <div class="w-full max-w-full md:max-w-screen-2xl flex-1 mx-auto flex relative">
      <RouterView />
    </div>
  </PConfigProvider>
</template>
