<script setup>
// import { zhCN } from 'pxd/locales'
</script>

<template>
  <!-- :locale="zhCN" -->
  <PConfigProvider class="flex flex-col">
    <SiteHeader />

    <div class="flex-1 container mx-auto flex relative">
      <RouterView />
    </div>
  </PConfigProvider>
</template>
