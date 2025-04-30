<script setup>
import { githubLink } from '@/consts/link'
import { version } from 'pxd'
</script>

<template>
  <main class="flex flex-col justify-center sm:h-screen sm:-mt-13 py-40 px-4 text-center relative max-w-2xl mx-auto">
    <div class="relative">
      <h1 class="font-bold inline text-6xl">
        PXD
      </h1>

      <PBadge variant="vue" class="absolute top-0">
        v{{ version }}
      </PBadge>
    </div>

    <p class="text-balance leading-tight text-lg text-secondary mt-8">
      A universal UI component library for Vue2&3
    </p>

    <div class="mt-16 justify-center flex gap-2">
      <PLinkButton
        :scale="false"
        shape="rounded"
        variant="primary"
        href="/guide"
      >
        Get Started

        <template #suffix>
          <IconArrowRight class="motion-safe:animate-[bounce-right_1s_ease-out_infinite]" />
        </template>
      </PLinkButton>

      <PLinkButton :href="githubLink" target="_blank" external-icon shape="rounded" variant="outline">
        <template #prefix>
          <IconStarFill class="text-amber-600" />
        </template>

        Star on GitHub
      </PLinkButton>
    </div>
  </main>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
  @keyframes bounce-right {
    0%,
    100% {
      transform: translateX(-20%) scale(1) translateZ(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    50% {
      transform: translateX(25%) scale(0.9) translateZ(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
}
</style>
