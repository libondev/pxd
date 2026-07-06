<script lang="ts" setup>
import type { CarouselState } from '../../contexts/carousel'
import type { CarouselEmits, CarouselProps } from './types'
import type { CSSProperties } from 'vue'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query'
import { useSwipeGesture } from '../../composables/use-swipe-gesture'
import { provideCarouselContext } from '../../contexts/carousel'
import { awaitAnimationEnd } from '../../utils/dom'
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
  indicatorType: 'dot',
  indicatorPosition: 'center',
})

const emits = defineEmits<CarouselEmits>()

let isToggling = false
let pendingDelta: number | null = null
let autoPlayTimerId: ReturnType<typeof setTimeout> | null = null
let isPointerEntering = false
let maxDrag = 0

const carousels = ref<CarouselState[]>([])
const sliderRef = shallowRef<HTMLElement>()
const virtualIndex = shallowRef(props.index)
const gestureMoveOffset = shallowRef(0)
const isReducedMotion = useMediaQuery(PRESET_MEDIA_QUERIES.MOTION_REDUCE)

const displayIndex = computed(() => {
  const length = carousels.value.length
  if (length === 0) {
    return 0
  }
  return ((virtualIndex.value % length) + length) % length
})

const isAtFirst = computed(() => displayIndex.value === 0)
const isAtLast = computed(() => displayIndex.value === carousels.value.length - 1)
const isHorizontal = computed(() => props.direction === 'horizontal')
const isLooping = computed(() => props.loop && carousels.value.length > 1)

const computedStyle = computed(() => {
  const translateValue = `calc(${virtualIndex.value * -100}% + ${gestureMoveOffset.value}px)`

  return {
    transform: `translate${isHorizontal.value ? 'X' : 'Y'}(${translateValue})`,
  }
})

const rootStyle = computed<CSSProperties>(() => {
  return {
    height: getCssUnitValue(props.height),
    '--carousel-item-count': carousels.value.length,
  }
})

const loopPlacement = computed(() => {
  const length = carousels.value.length
  const lastIndex = length - 1

  if (!isLooping.value || isReducedMotion.value) {
    return 'none'
  }

  if (virtualIndex.value <= 0) {
    return 'start'
  }

  if (virtualIndex.value >= lastIndex) {
    return 'end'
  }

  return 'none'
})

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

function getNextIndex(delta: number, length: number) {
  if (isLooping.value) {
    return normalizeIndex(virtualIndex.value + delta, length)
  }

  return Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
}

useSwipeGesture(sliderRef, {
  axis: () => props.direction,
  onPress: ({ size }) => {
    maxDrag = size

    gestureMoveOffset.value = 0
    onPointerEnter()
  },
  onFollow: (ev) => {
    if (!props.loop && ((isAtFirst.value && ev.delta > 0) || (isAtLast.value && ev.delta < 0))) {
      return
    }

    gestureMoveOffset.value = Math.max(-maxDrag, Math.min(maxDrag, ev.displacement))
  },
  onRelease: ({ swiped, direction }) => {
    gestureMoveOffset.value = 0
    onPointerLeave()

    if (!swiped || !direction) {
      return
    }

    if (isHorizontal.value) {
      performToggle(direction === 'left' ? 1 : -1)
    } else {
      performToggle(direction === 'top' ? 1 : -1)
    }
  },
})

async function performToggle(delta: number) {
  const length = carousels.value.length

  if (length === 0) {
    return
  }

  if (isReducedMotion.value) {
    virtualIndex.value = getNextIndex(delta, length)
    emits('change', virtualIndex.value)
    restartAutoPlay()
    return
  }

  await awaitAnimationEnd(sliderRef.value)

  if (isLooping.value) {
    virtualIndex.value += delta

    await nextTick()
    await awaitAnimationEnd(sliderRef.value)

    if (virtualIndex.value >= length) {
      await resetSliderPosition(0)
    } else if (virtualIndex.value <= -1) {
      await resetSliderPosition(length - 1)
    }
  } else {
    virtualIndex.value = Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
  }

  emits('change', virtualIndex.value)
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

async function resetSliderPosition(resetIndex: number) {
  const el = sliderRef.value
  if (!el) {
    return
  }

  el.style.transition = 'none'
  virtualIndex.value = resetIndex

  await nextTick()
  void el.offsetHeight
  el.style.transition = ''
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

  const deltaIndex = targetIndex - displayIndex.value

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
  registerCarousel,
  unregisterCarousel,
})

onMounted(async () => {
  await nextTick()

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
    :data-orientation="direction"
    :data-indicator-type="indicatorType"
    :data-indicator-position="indicatorPosition"
    :data-loop-placement="loopPlacement"
    class="pxd-carousel group relative w-full touch-none overflow-hidden"
    :style="rootStyle"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div class="pxd-carousel--container size-full overflow-clip">
      <div
        ref="sliderRef"
        class="pxd-carousel--slider translate-z-0 size-full active:transition-none motion-safe:transition-transform"
        :style="computedStyle"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel--indicator gap-2 absolute z-1 flex w-max items-center"
      @click="onIndicatorClick"
    >
      <slot name="indicator" :current="displayIndex" :total="carousels.length">
        <button
          v-for="(_, i) in carousels.length"
          :key="i"
          :data-index="i"
          class="pxd-carousel--indicator-item relative h-(--carousel-dot-height) w-(--carousel-dot-width) cursor-pointer appearance-none rounded-full bg-gray-alpha-200 font-inherit self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-colors"
          :class="{ 'bg-primary!': i === displayIndex }"
        />
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel--toggler gap-2 pointer-events-none absolute z-1 flex">
      <button
        type="button"
        aria-label="Carousel arrow left"
        :disabled="!loop && isAtFirst"
        class="pxd-carousel--prev-btn p-1.5 pointer-events-auto cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none enabled:hover:bg-background-hover enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="pointer-events-none rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        :disabled="!loop && isAtLast"
        class="pxd-carousel--next-btn p-1.5 pointer-events-auto cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none enabled:hover:bg-background-hover enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon class="pointer-events-none" />
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
    &[data-indicator-position='bottom'],
    &[data-indicator-position='center'] {
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
      left: 0.75rem;
      top: 0.5rem;
    }

    .pxd-carousel--toggler {
      right: 0.5rem;
      top: 0.5rem;
    }
  }

  &[data-indicator-position='bottom'] {
    .pxd-carousel--indicator {
      left: 0.75rem;
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
      top: 0.75rem;
    }

    .pxd-carousel--toggler {
      left: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='right'] {
    .pxd-carousel--indicator {
      right: 0.5rem;
      top: 0.75rem;
    }

    .pxd-carousel--toggler {
      right: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='center'] {
    .pxd-carousel--indicator {
      left: 50%;
      bottom: 0.5rem;
      transform: translateX(-50%);
    }

    .pxd-carousel--toggler {
      left: 0;
      top: 50%;
      width: 100%;
      padding-inline: 1rem;
      justify-content: space-between;
      transform: translateY(-50%);
    }
  }

  &[data-indicator-position='left'],
  &[data-indicator-position='right'] {
    .pxd-carousel--indicator,
    .pxd-carousel--toggler {
      flex-direction: column;
    }
  }

  &[data-orientation='horizontal'] .pxd-carousel--slider {
    display: flex;
  }

  &[data-loop-placement='end'] .pxd-carousel-item:first-child {
    transform: translateX(calc(var(--carousel-item-count) * 100%));
  }

  &[data-loop-placement='start'] .pxd-carousel-item:last-child {
    transform: translateX(calc(var(--carousel-item-count) * -100%));
  }

  &[data-orientation='vertical'] {
    &[data-loop-placement='end'] .pxd-carousel-item:first-child {
      transform: translateY(calc(var(--carousel-item-count) * 100%));
    }

    &[data-loop-placement='start'] .pxd-carousel-item:last-child {
      transform: translateY(calc(var(--carousel-item-count) * -100%));
    }

    .pxd-carousel--prev-btn,
    .pxd-carousel--next-btn {
      transform: rotate(90deg);
    }
  }
}

.pxd-carousel--indicator-item::before {
  content: '';
  position: absolute;
  inset: -0.25rem;
}
</style>
