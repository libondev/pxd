<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center">
    <h1 class="mb-8 text-lg text-balance text-center">
      <span class="font-medium">404</span>
      <span class="ml-2">Sorry, the page you are looking for does not exist.</span>
    </h1>

    <PLinkButton href="/components">
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
