<script lang="ts" setup>
import type { CarouselState } from '../../contexts/carousel'
import type { CarouselGroupEmits, CarouselGroupProps } from '../carousel/types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { provideCarouselGroupContext } from '../../contexts/carousel'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PCarouselGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CarouselGroupProps>(), {
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

const emits = defineEmits<CarouselGroupEmits>()

const TRANSITION_CLASSES = ['transition-transform', 'duration-[calc(var(--duration,200ms)+100ms)]']

let autoPlayRafId: number | null = null
let autoPlaySession = 0
let isPointerEntering = false
let toggleQueue: Promise<void> = Promise.resolve()

const carousels = ref<CarouselState[]>([])
const sliderRef = shallowRef<HTMLElement>()
const virtualIndex = shallowRef(props.index)

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

const computedStyle = computed(() => {
  const translateValue = virtualIndex.value * -100

  const styles = {
    transform:
      props.direction === 'horizontal'
        ? `translateX(${translateValue}%)`
        : `translateY(${translateValue}%)`,
  }

  return styles
})

function translateItems() {
  carousels.value.forEach((carousel, index) => {
    carousel.translateItem(index, virtualIndex.value)
  })
}

// wait for the animation to end before performing the next action
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
  } else {
    virtualIndex.value = Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
  }

  emits('change', correctIndex.value)
  nextTick(onPointerLeave)
}

function onToggleClick(delta: number) {
  // serialize all toggle triggers to avoid concurrent execution on rapid interactions
  toggleQueue = toggleQueue
    .catch(() => {})
    .then(async () => {
      await performToggle(delta)
    })

  return toggleQueue
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
  const indexBefore = virtualIndex.value
  const lastIndex = length - 1

  if (!props.loop) {
    const isAtFirstAndGoPrev = indexBefore <= 0 && delta < 0
    const isAtLastAndGoNext = indexBefore >= lastIndex && delta > 0
    if (isAtFirstAndGoPrev || isAtLastAndGoNext) {
      return
    }
  }

  if (ev.cancelable) {
    ev.preventDefault()
  }

  onToggleClick(delta)
}

function resetContainerPosition(resetIndex: number) {
  const containerClassList = sliderRef.value!.classList

  containerClassList.remove(...TRANSITION_CLASSES)

  virtualIndex.value = resetIndex
  translateItems()

  setTimeout(() => {
    containerClassList.add(...TRANSITION_CLASSES)
  }, 0)
}

function onTransitionsEnd(ev: TransitionEvent) {
  if (ev.propertyName !== 'transform' || ev.target !== sliderRef.value) {
    return
  }

  if (!props.loop) {
    return
  }

  if (virtualIndex.value >= carousels.value.length) {
    resetContainerPosition(0)
  } else if (virtualIndex.value <= -1) {
    resetContainerPosition(carousels.value.length - 1)
  }
}

function clearAutoPlayTimer() {
  autoPlaySession++
  if (autoPlayRafId != null) {
    cancelAnimationFrame(autoPlayRafId)
    autoPlayRafId = null
  }
}

function setAutoPlayTimer() {
  const mySession = autoPlaySession
  const startTime = performance.now()

  const onAnimationFrame = () => {
    if (mySession !== autoPlaySession || isPointerEntering) {
      return
    }

    const currentTime = performance.now()
    const elapsedTime = currentTime - startTime

    if (elapsedTime >= props.interval) {
      onToggleClick(1)
      return
    }

    autoPlayRafId = requestAnimationFrame(onAnimationFrame)
  }

  autoPlayRafId = requestAnimationFrame(onAnimationFrame)
}

function onPointerEnter() {
  if (props.pauseOnHover) {
    isPointerEntering = true
    clearAutoPlayTimer()
  }
}

function onPointerLeave() {
  isPointerEntering = false

  if (!props.autoplay) {
    return
  }

  clearAutoPlayTimer()
  setAutoPlayTimer()
}

function onIndicatorClick(ev: MouseEvent) {
  clearAutoPlayTimer()

  const targetEl = (ev.target as HTMLElement).closest('[data-index]') as HTMLButtonElement | null
  const targetIndex = Number(targetEl?.dataset.index)

  if (Number.isNaN(targetIndex)) {
    return
  }

  const deltaIndex = targetIndex - virtualIndex.value

  if (deltaIndex !== 0) {
    onToggleClick(deltaIndex)
  }

  nextTick(onPointerLeave)
}

function registerCarousel(state: CarouselState) {
  carousels.value.push(state)
}

function unregisterCarousel(id: string) {
  carousels.value = carousels.value.filter(({ uid }) => uid !== id)
}

// usePointerGesture(sliderRef, {
//   axis: () => (props.direction === 'horizontal' ? 'x' : 'y'),
//   directionGuard: (d) => {
//     if (props.direction === 'horizontal') {
//       return d === 'left' || d === 'right'
//     }

//     return d === 'up' || d === 'down'
//   },
//   onRelease(hit, dir, kind) {
//     if (!hit || !dir || kind === 'longpress') {
//       return
//     }

//     if (dir === 'left' || dir === 'up') {
//       onToggleClick(1)
//     } else if (dir === 'right' || dir === 'down') {
//       onToggleClick(-1)
//     }
//   },
// })

provideCarouselGroupContext({
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
})

onMounted(async () => {
  onPointerLeave()

  await nextTick()

  translateItems()
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
    class="pxd-carousel-group group relative w-full touch-none overflow-hidden"
    :style="{ height: getCssUnitValue(height) }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div class="pxd-carousel-group--container size-full">
      <div
        ref="sliderRef"
        class="pxd-carousel-group--slider translate-z-0 size-full"
        :style="computedStyle"
        :class="TRANSITION_CLASSES"
        @transitionend="onTransitionsEnd"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel-group--indicator gap-2 absolute flex w-max items-center"
      @click="onIndicatorClick"
    >
      <slot name="indicator" :current="correctIndex + 1" :total="carousels.length">
        <button
          v-for="(_, i) in carousels.length"
          :key="i"
          :data-index="i"
          class="pxd-carousel-group--indicator-item relative h-(--carousel-dot-height) w-(--carousel-dot-width) cursor-pointer appearance-none rounded-full bg-gray-alpha-200 font-inherit self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-colors"
          :class="{ 'bg-primary!': i === correctIndex }"
        />
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel-group--toggler gap-2 absolute flex">
      <button
        type="button"
        aria-label="Carousel arrow left"
        class="pxd-carousel-group--prev-btn p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover active:bg-background-active disabled:pointer-events-none motion-safe:transition-colors"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        class="pxd-carousel-group--next-btn p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover active:bg-background-active disabled:pointer-events-none motion-safe:transition-colors"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon />
      </button>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-carousel-group {
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
    .pxd-carousel-group--indicator {
      left: 12px;
      top: 0.5rem;
    }

    .pxd-carousel-group--toggler {
      right: 0.5rem;
      top: 0.5rem;
    }
  }

  &[data-indicator-position='bottom'] {
    .pxd-carousel-group--indicator {
      left: 12px;
      bottom: 0.5rem;
    }

    .pxd-carousel-group--toggler {
      right: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='left'] {
    .pxd-carousel-group--indicator {
      left: 0.5rem;
      top: 12px;
    }

    .pxd-carousel-group--toggler {
      left: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-indicator-position='right'] {
    .pxd-carousel-group--indicator {
      right: 0.5rem;
      top: 12px;
    }

    .pxd-carousel-group--toggler {
      right: 0.5rem;
      bottom: 0.5rem;
    }
  }

  &[data-direction='horizontal'] .pxd-carousel-group--slider {
    display: flex;
  }

  &[data-direction='vertical'] {
    .pxd-carousel-group--prev-btn,
    .pxd-carousel-group--next-btn {
      transform: rotate(90deg);
    }
  }

  &[data-indicator-position='left'],
  &[data-indicator-position='right'] {
    .pxd-carousel-group--indicator,
    .pxd-carousel-group--toggler {
      flex-direction: column;
    }
  }
}

.pxd-carousel-group--indicator-item::before {
  content: '';
  position: absolute;
  inset: -0.25rem;
}
</style>
