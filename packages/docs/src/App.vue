<script setup>
</script>

<template>
  <PConfigProvider class="flex flex-col min-h-screen">
    <SiteHeader />

    <div class="flex-1 container mx-auto flex relative">
      <RouterView />
    </div>
  </PConfigProvider>
</template>
