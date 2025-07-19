<script setup>
import { useHead } from '@unhead/vue'
import { version } from 'pxd'
import { githubLink } from '@/consts/link'

useHead({
  title: 'PXD - A universal UI component library for Vue2&3',
})
</script>

<template>
  <main class="w-full px-4 relative max-w-screen-lg mx-auto">
    <section class="my-28 py-12 sm:py-28 text-center">
      <div class="relative">
        <h1 class="font-bold inline text-6xl">
          PXD
        </h1>

        <PBadge variant="vue" class="absolute top-0 select-none">
          v{{ version }}
        </PBadge>
      </div>

      <p class="text-balance leading-tight text-lg text-foreground-secondary mt-8">
        A universal UI component library for Vue2&3
      </p>

      <div class="mt-16 justify-center flex gap-3">
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

        <PLinkButton :href="githubLink" target="_blank" external-icon shape="rounded">
          <template #prefix>
            <IconStarFill class="text-amber-600" />
          </template>

          Star on GitHub
        </PLinkButton>
      </div>
    </section>

    <hr class="mx-12 mb-8 sm:mb-20">

    <section class="py-20 mb-8 flex flex-wrap gap-4 cursor-default">
      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Consistent experience
        </h3>

        <PText secondary>
          It can run in 2 and 3 without modifying any syntax.
        </PText>
      </div>

      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Full light and dark support
        </h3>

        <PText secondary>
          It takes little effort to make all components natively support light and dark mode. See<PLinkButton
            href="/components/theme-switcher#premise"
            class="text-foreground underline"
            type="text"
            text="here"
          />for more information.
        </PText>
      </div>

      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          On demand Import
        </h3>

        <PText secondary>
          Provide resolver to automatically import only used components.
        </PText>
      </div>

      <div class="p-5 rounded-lg border w-full sm:w-[calc(50%-0.5rem)]">
        <h3 class="font-medium mb-1.5">
          Support for reducing animation
        </h3>

        <PText secondary>
          Set <code class="text-foreground-secondary">prefers-reduced-motion: reduce</code> to disable transitions and animations in components.
        </PText>
      </div>
    </section>
  </main>
</template>

<style>
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
</style>

<route lang="yaml">
meta:
  layout: false
</route>
