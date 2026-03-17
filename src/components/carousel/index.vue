<script lang="ts" setup>
import type { CarouselState } from '../../contexts/carousel'
import type { CarouselEmits, CarouselProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { provideCarouselContext } from '../../contexts/carousel'
import { doubleRaf } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PCarousel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CarouselProps>(), {
  index: 0,
  loop: true,
  arrow: true,
  height: 180,
  autoplay: true,
  interval: 3000,
  indicator: true,
  direction: 'horizontal',
  pauseOnHover: true,
  indicatorType: 'line',
  indicatorPosition: 'bottom',
})

const emits = defineEmits<CarouselEmits>()

let autoPlayTimerId: ReturnType<typeof setTimeout> | null = null
let isPointerEntering = false
let isToggling = false
let pendingDelta: number | null = null

const carousels = ref<CarouselState[]>([])
const sliderRef = shallowRef<HTMLElement>()
const virtualIndex = shallowRef(props.index)
const isTransitioning = shallowRef(true)

// since the virtual index may exceed the range to facilitate seamless switching,
// a boundary index is needed to indicate the real index
const correctIndex = computed(() => {
  const index = virtualIndex.value

  if (index >= carousels.value.length) {
    return 0
  }

  if (index <= -1) {
    return carousels.value.length - 1
  }

  return index
})

const isAtFirst = computed(() => virtualIndex.value <= 0)
const isAtLast = computed(() => virtualIndex.value >= carousels.value.length - 1)

const computedStyle = computed(() => {
  const translateValue = virtualIndex.value * -100

  return {
    transform:
      props.direction === 'horizontal'
        ? `translateX(${translateValue}%)`
        : `translateY(${translateValue}%)`,
  }
})

function translateItems() {
  carousels.value.forEach((carousel, index) => {
    carousel.translateItem(index, virtualIndex.value)
  })
}

async function awaitAnimationEnd() {
  const animations = sliderRef.value?.getAnimations() ?? []
  await Promise.allSettled(animations.map((a) => a.finished))
}

async function performToggle(delta: number) {
  const length = carousels.value.length

  if (length === 0) {
    return
  }

  await awaitAnimationEnd()

  if (props.loop) {
    virtualIndex.value += delta

    translateItems()

    await nextTick()
    await awaitAnimationEnd()

    if (virtualIndex.value >= length) {
      await resetContainerPosition(0)
    } else if (virtualIndex.value <= -1) {
      await resetContainerPosition(length - 1)
    }
  } else {
    virtualIndex.value = Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
  }

  emits('change', correctIndex.value)
  restartAutoPlay()
}

async function onToggleClick(delta: number) {
  if (isToggling) {
    pendingDelta = delta
    return
  }

  isToggling = true

  try {
    await performToggle(delta)

    while (pendingDelta != null) {
      const next = pendingDelta
      pendingDelta = null
      await performToggle(next)
    }
  } finally {
    isToggling = false
  }
}

function onWheelToggle(ev: WheelEvent) {
  if (!props.toggleOnWheel) {
    return
  }

  const length = carousels.value.length

  if (length <= 1) {
    return
  }

  const delta = ev.deltaY > 0 ? 1 : -1

  if (!props.loop) {
    const isAtFirstAndGoPrev = isAtFirst.value && delta < 0
    const isAtLastAndGoNext = isAtLast.value && delta > 0
    if (isAtFirstAndGoPrev || isAtLastAndGoNext) {
      return
    }
  }

  if (ev.cancelable) {
    ev.preventDefault()
  }

  onToggleClick(delta)
}

async function resetContainerPosition(resetIndex: number) {
  isTransitioning.value = false
  virtualIndex.value = resetIndex
  translateItems()

  await new Promise<void>((resolve) => {
    doubleRaf(() => {
      isTransitioning.value = true
      resolve()
    })
  })
}

function clearAutoPlayTimer() {
  if (autoPlayTimerId != null) {
    clearTimeout(autoPlayTimerId)
    autoPlayTimerId = null
  }
}

function restartAutoPlay() {
  clearAutoPlayTimer()

  if (!props.autoplay || isPointerEntering) {
    return
  }

  autoPlayTimerId = setTimeout(() => {
    onToggleClick(1)
  }, props.interval)
}

function onPointerEnter() {
  if (props.pauseOnHover) {
    isPointerEntering = true
    clearAutoPlayTimer()
  }
}

function onPointerLeave() {
  isPointerEntering = false
  restartAutoPlay()
}

function onIndicatorClick(ev: MouseEvent) {
  const targetEl = (ev.target as HTMLElement).closest('[data-index]') as HTMLButtonElement | null
  const targetIndex = Number(targetEl?.dataset.index)

  if (Number.isNaN(targetIndex)) {
    return
  }

  const deltaIndex = targetIndex - virtualIndex.value

  if (deltaIndex !== 0) {
    clearAutoPlayTimer()
    onToggleClick(deltaIndex)
  }
}

function registerCarousel(state: CarouselState) {
  carousels.value.push(state)
}

function unregisterCarousel(id: string) {
  carousels.value = carousels.value.filter(({ uid }) => uid !== id)
}

provideCarouselContext({
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
})

onMounted(async () => {
  await nextTick()

  translateItems()
  restartAutoPlay()
})

onBeforeUnmount(() => {
  clearAutoPlayTimer()
  carousels.value = []
})
</script>

<template>
  <div
    v-bind="$attrs"
    :data-direction="direction"
    :data-indicator-type="indicatorType"
    :data-indicator-position="indicatorPosition"
    class="pxd-carousel group relative w-full touch-none overflow-hidden"
    :style="{ height: getCssUnitValue(height) }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div class="pxd-carousel--container size-full">
      <div
        ref="sliderRef"
        class="pxd-carousel--slider translate-z-0 size-full"
        :class="{
          'motion-safe:transition-transform': isTransitioning,
        }"
        :style="computedStyle"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel--indicator gap-2 absolute flex w-max items-center"
      @click="onIndicatorClick"
    >
      <slot name="indicator" :current="correctIndex + 1" :total="carousels.length">
        <button
          v-for="(_, i) in carousels.length"
          :key="i"
          :data-index="i"
          class="pxd-carousel--indicator-item relative h-(--carousel-dot-height) w-(--carousel-dot-width) cursor-pointer appearance-none rounded-full bg-gray-alpha-200 font-inherit self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-colors"
          :class="{ 'bg-primary!': i === correctIndex }"
        />
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel--toggler gap-2 absolute flex">
      <button
        type="button"
        aria-label="Carousel arrow left"
        :disabled="!loop && isAtFirst"
        class="pxd-carousel--prev-btn p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover active:bg-background-active disabled:pointer-events-none disabled:opacity-40 motion-safe:transition-colors"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        :disabled="!loop && isAtLast"
        class="pxd-carousel--next-btn p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover active:bg-background-active disabled:pointer-events-none disabled:opacity-40 motion-safe:transition-colors"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon />
      </button>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-carousel {
  &[data-indicator-type='dot'] {
    --carousel-dot-width: 0.5rem;
    --carousel-dot-height: 0.5rem;
  }

  &[data-indicator-type='line'] {
    &[data-indicator-position='top'],
    &[data-indicator-position='bottom'] {
      --carousel-dot-width: 1rem;
      --carousel-dot-height: 0.25rem;
    }

    &[data-indicator-position='left'],
    &[data-indicator-position='right'] {
      --carousel-dot-width: 0.25rem;
      --carousel-dot-height: 1rem;
    }
  }

  &[data-indicator-position='top'] {
    .pxd-carousel--indicator {
      left: 12px;
      top: 0.5rem;
    }

    .pxd-carousel--toggler {
      right: 0.5rem;
      top: 0.5rem;
    }
  }

  &[data-indicator-position='bottom'] {
    .pxd-carousel--indicator {
      left: 12px;
      bottom: 0.5rem;
    }

    .pxd-carousel--toggler {
      right: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='left'] {
    .pxd-carousel--indicator {
      left: 0.5rem;
      top: 12px;
    }

    .pxd-carousel--toggler {
      left: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='right'] {
    .pxd-carousel--indicator {
      right: 0.5rem;
      top: 12px;
    }

    .pxd-carousel--toggler {
      right: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-direction='horizontal'] .pxd-carousel--slider {
    display: flex;
  }

  &[data-direction='vertical'] {
    .pxd-carousel--prev-btn,
    .pxd-carousel--next-btn {
      transform: rotate(90deg);
    }
  }

  &[data-indicator-position='left'],
  &[data-indicator-position='right'] {
    .pxd-carousel--indicator,
    .pxd-carousel--toggler {
      flex-direction: column;
    }
  }
}

.pxd-carousel--indicator-item::before {
  content: '';
  position: absolute;
  inset: -0.25rem;
}
</style>
