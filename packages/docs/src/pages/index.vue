<script setup>
import { useHead } from '@unhead/vue'
import { off, on, once } from 'pxd/utils/event'
import { githubLink } from '@/consts/link'

useHead({
  title: 'PXD - A universal UI component library for Vue2&3',
})

const bindEvents = []

function setParallaxEffect() {
  const cards = document.querySelectorAll('.feature-item')

  cards.forEach((card) => {
    const cancelFn = on(card, 'mouseenter', (e) => {
      const rect = e.target.getBoundingClientRect()
      const maxTilt = 20 // 最大倾斜角度

      const onMouseMove = (e) => {
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5

        card.style.transform = `
          perspective(1000px)
          rotateX(${y * maxTilt}deg)
          rotateY(${x * -maxTilt}deg)
        `
      }

      const onMouseLeave = () => {
        card.style.transform = `
          perspective(1000px)
          rotateX(0deg)
          rotateY(0deg)
          `

        off(card, 'mousemove', onMouseMove)
      }

      on(card, 'mousemove', onMouseMove)
      once(card, 'mouseleave', onMouseLeave)
    })

    bindEvents.push(cancelFn)
  })
}

onMounted(() => {
  setParallaxEffect()
})

onBeforeUnmount(() => {
  bindEvents.forEach(fn => fn())
})
</script>

<template>
  <main class="px-4 max-w-screen-lg relative mx-auto w-full">
    <section class="my-28 py-12 sm:py-28 text-center">
      <div class="relative">
        <h1 class="font-bold text-6xl inline">
          PXD
        </h1>

        <span class="top-0 absolute select-none">
          <img src="https://img.shields.io/npm/v/pxd.svg">
        </span>
      </div>

      <p class="leading-tight text-lg mt-8 text-balance text-foreground-secondary">
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
            <IconArrowRight />
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

    <section class="features py-20 mb-8 gap-4 relative flex cursor-default flex-wrap">
      <div
        class="feature-item p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg hover:border-primary"
      >
        <h3 class="font-medium mb-1.5">
          Consistent experience
        </h3>

        <PText secondary>
          It can run in 2 and 3 without modifying any syntax.
        </PText>
      </div>

      <div
        class="feature-item p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg hover:border-primary"
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
      </div>

      <div
        class="feature-item p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg hover:border-primary"
      >
        <h3 class="font-medium mb-1.5">
          On demand Import
        </h3>

        <PText secondary>
          Provide resolver to automatically import only used components.
        </PText>
      </div>

      <div
        class="feature-item p-5 sm:w-[calc(50%-0.5rem)] relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:shadow-lg hover:border-primary"
      >
        <h3 class="font-medium mb-1.5">
          Support for reducing animation
        </h3>

        <PText secondary>
          Set
          <code class="text-foreground-secondary">prefers-reduced-motion: reduce</code>
          to disable transitions and animations in components.
        </PText>
      </div>
    </section>
  </main>
</template>
