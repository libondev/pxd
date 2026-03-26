<script setup>
import { useHead } from '@unhead/vue'
import { on } from 'pxd/utils/event'
import { githubLink } from '@/consts/link'

useHead({
  title: `PXD - Universal Vue 2.7 & Vue 3.2+ UI Component Library`,
})

const cleanupFns = []

function setParallaxEffect() {
  const container = document.querySelector('.features')
  if (!container) {
    return
  }

  const maxTilt = 20 // 最大倾斜角度

  const onMouseMove = (e) => {
    const card = e.target.closest('.feature-item')
    if (!card) {
      return
    }

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    card.style.transform = `
      perspective(1000px)
      rotateX(${y * -maxTilt}deg)
      rotateY(${x * maxTilt}deg)
    `
  }

  const onMouseOut = (e) => {
    const card = e.target.closest('.feature-item')
    if (!card) {
      return
    }

    // 检查是否真正离开了卡片（而不是移动到子元素）
    const relatedCard = e.relatedTarget?.closest?.('.feature-item')
    if (card !== relatedCard) {
      card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
      `
    }
  }

  cleanupFns.push(on(container, 'mousemove', onMouseMove), on(container, 'mouseout', onMouseOut))
}

onMounted(() => {
  setParallaxEffect()
})

onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => fn())
})
</script>

<template>
  <main class="px-6 xl:border-x relative mx-auto w-full">
    <section class="my-28 py-12 sm:py-28 text-center">
      <div class="relative">
        <h1 class="text-6xl font-bold inline">PXD</h1>

        <span class="top-0 ml-1 absolute select-none">
          <PTooltip content="Released latest version">
            <a href="https://www.npmjs.com/package/pxd" target="_blank">
              <img src="https://img.shields.io/npm/v/pxd.svg" />
            </a>
          </PTooltip>
        </span>
      </div>

      <p
        class="mt-8 max-w-xl leading-relaxed! leading-tight mx-auto text-balance text-foreground-secondary"
      >
        Built-in light/dark theme, PC & mobile ready, animation-free mode supported. One codebase
        for Vue 2.7+ & Vue 3.2+. Written in TypeScript.
      </p>

      <div class="mt-16 gap-3 flex justify-center">
        <PLinkButton :scale="false" shape="rounded" variant="primary" href="/guide/introduction">
          Get Started

          <template #suffix>
            <IconArrowRight />
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

    <hr class="mb-8 sm:mb-20 sm:max-w-3xl max-sm:w-3/4 mx-auto" />

    <section
      class="features mb-8 max-w-5xl gap-4 py-20 relative mx-auto flex cursor-default flex-wrap"
    >
      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">Consistent experience</h3>

        <PText secondary> It can run in 2 and 3 without modifying any syntax. </PText>
      </div>

      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">Full light and dark support</h3>

        <PText secondary>
          Switch themes in the blink of an eye without any effort. See
          <RouterLink to="/components/theme-switcher#premise" class="text-foreground underline"
            >here</RouterLink
          >
          for more information.
        </PText>
      </div>

      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">On demand Import</h3>

        <PText secondary> Provide resolver to automatically import only used components. </PText>
      </div>

      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">Support for reducing animation</h3>

        <PText secondary>
          Set
          <code class="text-gray-900">prefers-reduced-motion: reduce</code>
          to disable transitions and animations in components.
        </PText>
      </div>

      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">Extremely customizable</h3>

        <PText secondary>
          Globally overridable components <span class="font-medium">transition-duration</span> and
          <span class="font-medium">transition-timing-function</span>.
        </PText>
      </div>

      <div
        class="feature-item min-h-28 p-5 sm:w-[calc(50%-0.5rem)] hover:shadow-lg relative z-2 w-full overflow-hidden rounded-lg border duration-180 hover:border-primary"
      >
        <h3 class="mb-1.5 font-medium">Responsive components</h3>

        <PText secondary> Customized style design on desktop or mobile devices. </PText>
      </div>
    </section>
  </main>
</template>

<route lang="yaml">
meta:
  layout: false
</route>
