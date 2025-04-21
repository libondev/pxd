<script setup>
import { ArrowRightIcon } from 'gdsi/vue'
</script>

<template>
  <main class="px-4 py-24 text-center sm:py-32 md:py-48 relative max-w-2xl mx-auto mb-32">
    <h1 class="text-balance text-6xl font-bold">
      PXD
    </h1>

    <p class="leading-tight text-lg text-secondary mt-8">
      A universal UI component library for Vue2&3
    </p>

    <div class="mt-16">
      <PButton variant="primary" href="/about" shape="rounded">
        Get Started

        <template #suffix>
          <ArrowRightIcon />
        </template>
      </PButton>
    </div>
  </main>
</template>
