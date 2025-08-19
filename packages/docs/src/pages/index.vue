<script setup>
import { useHead } from '@unhead/vue'
import { version } from 'pxd'
import { githubLink } from '@/consts/link'

useHead({
  title: 'PXD - A universal UI component library for Vue2&3',
})

onMounted(() => {
  const dots = document.querySelectorAll('.dot')
  const cards = document.querySelectorAll('.card')

  cards.forEach((card, idx) => {
    card.addEventListener('mouseenter', (e) => {
      const rect = e.target.getBoundingClientRect()
      const maxTilt = 20 // 最大倾斜角度
      const dot = dots[idx]

      const onMouseMove = (e) => {
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5

        card.style.transform = `
          perspective(1000px)
          rotateX(${y * maxTilt}deg)
          rotateY(${x * -maxTilt}deg)
        `
        dot.style = `
          left: ${(x + 0.5) * rect.width}px;
          top: ${(y + 0.5) * rect.height}px;
          opacity: 0.5;
        `
      }

      card.addEventListener('mousemove', onMouseMove)
      card.addEventListener('mouseleave', () => {
        card.style.transform = `
          perspective(1000px)
          rotateX(0deg)
          rotateY(0deg)
          `
        dot.style.opacity = 0

        card.removeEventListener('mousemove', onMouseMove)
      })
    })
  })
})
</script>

<template>
  <main class="px-4 max-w-screen-lg relative mx-auto w-full">
    <section class="my-28 py-12 sm:py-28 text-center">
      <div class="relative">
        <h1 class="font-bold text-6xl inline">
          PXD
        </h1>

        <PBadge variant="vue" class="top-0 absolute select-none">
          v{{ version }}
        </PBadge>
      </div>

      <p
        class="leading-tight text-lg mt-8 text-balance text-foreground-secondary"
      >
        A universal UI component library for Vue2&3
      </p>

      <div class="mt-16 gap-3 flex justify-center">
        <PLinkButton
          :scale="false"
          shape="rounded"
          variant="primary"
          href="/guide/introduction"
        >
          Get Started

          <template #suffix>
            <IconArrowRight
              class="motion-safe:animate-[bounce-right_1s_ease-out_infinite]"
            />
          </template>
        </PLinkButton>

        <PLinkButton
          :href="githubLink"
          target="_blank"
          external-icon
          shape="rounded"
        >
          <template #prefix>
            <IconStarFill class="text-amber-600" />
          </template>

          Star on GitHub
        </PLinkButton>
      </div>
    </section>

    <hr class="mx-12 mb-8 sm:mb-20">

    <section class="py-20 mb-8 gap-4 relative flex cursor-default flex-wrap">
      <div
        class="card p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg"
      >
        <h3 class="font-medium mb-1.5">
          Consistent experience
        </h3>

        <PText secondary>
          It can run in 2 and 3 without modifying any syntax.
        </PText>

        <div
          class="dot w-4 h-4 bg-black pointer-events-none absolute z-1 rounded-lg opacity-0"
        />
      </div>

      <div
        class="card p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg"
      >
        <h3 class="font-medium mb-1.5">
          Full light and dark support
        </h3>

        <PText secondary>
          It takes little effort to make all components natively support light
          and dark mode. See<PLinkButton
            href="/components/theme-switcher#premise"
            class="text-foreground underline"
            type="text"
            text="here"
          />for more information.
        </PText>

        <div
          class="dot w-4 h-4 bg-black pointer-events-none absolute z-1 rounded-lg opacity-0"
        />
      </div>

      <div
        class="card p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg"
      >
        <h3 class="font-medium mb-1.5">
          On demand Import
        </h3>

        <PText secondary>
          Provide resolver to automatically import only used components.
        </PText>

        <div
          class="dot w-4 h-4 bg-black pointer-events-none absolute z-1 rounded-lg opacity-0"
        />
      </div>

      <div
        class="card p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg"
      >
        <h3 class="font-medium mb-1.5">
          Support for reducing animation
        </h3>

        <PText secondary>
          Set
          <code class="text-foreground-secondary">prefers-reduced-motion: reduce</code>
          to disable transitions and animations in components.
        </PText>

        <div
          class="dot w-4 h-4 bg-black pointer-events-none absolute z-1 rounded-lg opacity-0"
        />
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
