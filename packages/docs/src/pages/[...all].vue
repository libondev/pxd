<script lang="ts" setup>
import { useHead } from '@unhead/vue'

useHead({
  title: '404 Not found - PXD',
})
</script>

<template>
  <div class="xl:border-x flex h-[calc(100vh-50px)] w-full flex-col items-center justify-center">
    <h1 class="mb-8 text-center text-balance">
      <span class="font-medium">404</span>
      <span class="ml-2">Sorry, the page you are looking for does not exist.</span>
    </h1>

    <PLinkButton href="/guide/components">
      <template #prefix>
        <IconArrowLeft />
      </template>

      Back Components Page
    </PLinkButton>
  </div>
</template>

<route lang="yaml">
meta:
  layout: false
</route>
