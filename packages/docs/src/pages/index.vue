<script setup>
import { githubLink } from '@/consts/link'
import { version } from 'pxd'
</script>

<template>
  <main class="sm:h-screen w-full px-4 relative max-w-screen-lg mx-auto">
    <section class="py-40 text-center">
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
    </section>

    <hr class="mx-12">

    <section class="py-20 flex flex-wrap gap-4 cursor-default">
      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Consistent experience
        </h3>

        <p class="text-secondary text-sm">
          It can run in 2 and 3 without modifying any syntax.
        </p>
      </div>

      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Full light and dark support
        </h3>

        <p class="text-secondary text-sm">
          It takes little effort to make all components natively support light and dark mode. See
          <RouterLink
            to="/components/color-scheme"
            class="text-primary font-medium mr-0.5"
          >
            here
          </RouterLink>
          for more information.
        </p>
      </div>

      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Support for reducing animation
        </h3>

        <p class="text-secondary text-sm">
          Set <code class="text-gray-900">prefers-reduced-motion: reduce</code> to disable transitions and animations in components.
        </p>
      </div>
    </section>
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
