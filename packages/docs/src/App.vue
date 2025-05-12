<script setup>
// import { zhCN } from 'pxd/locales'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex flex-col min-h-screen">
    <SiteHeader />

    <div class="flex-1 container mx-auto flex relative">
      <RouterView />
    </div>
  </PConfigProvider>
</template>
