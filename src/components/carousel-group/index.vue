<script lang="ts" setup>
import type { CarouselGroupProps, CarouselItemState } from './constants'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, onBeforeUnmount, provide, shallowRef } from 'vue'
import { throttle } from '../../utils/fn'
import { getCssUnitValue } from '../../utils/format'
import { carouselGroupContextKey } from './constants'

defineOptions({
  name: 'PCarouselGroup',
})

const props = withDefaults(
  defineProps<CarouselGroupProps>(),
  {
    index: 0,
    loop: true,
    arrow: true,
    autoplay: true,
    interval: 3000,
    direction: 'horizontal',
    pauseOnHover: true,
    toggleOnWheel: true,
  },
)

const emits = defineEmits<{
  change: [index: number]
}>()

const containerRef = shallowRef<HTMLDivElement>()

const slides = shallowRef<CarouselItemState[]>([])
const internalIndex = shallowRef(props.index)
const disableTransition = shallowRef(false)

const computedStyle = computed(() => {
  let translate = 0

  if (internalIndex.value === -1) {
    translate = (slides.value.length - 1) * -100
  } else {
    translate = internalIndex.value * -100
  }

  const styles = {
    '--h': getCssUnitValue(props.height),
    'transform': props.direction === 'horizontal'
      ? `translateX(${translate}%)`
      : `translateY(${translate}%)`,
  }

  return styles
})

const onToggleClick = throttle((delta: number) => {
  const max = slides.value.length

  if (max === 0) {
    return
  }

  if (props.loop) {
    if (internalIndex.value === max - 1) {
      internalIndex.value = max
    } else {
      internalIndex.value = (internalIndex.value + delta + max) % max
      translateItems()
    }

    disableTransition.value = internalIndex.value === 0 || internalIndex.value === max
  } else {
    internalIndex.value = Math.max(0, Math.min(internalIndex.value + delta, max - 1))
  }

  emits('change', internalIndex.value)
}, 0)

function translateItems() {
  slides.value.forEach((carousel, index) => {
    carousel.translateItem(index, internalIndex.value)
  })
}

function resetContainerPosition() {
  containerRef.value!.style.transitionDuration = '0'

  slides.value.forEach((carousel) => {
    carousel.resetPosition()
  })

  if (internalIndex.value === slides.value.length) {
    internalIndex.value = 1
  } else if (internalIndex.value === slides.value.length) {
    internalIndex.value = slides.value.length - 1
  }

  containerRef.value!.style.transitionDuration = ''
  disableTransition.value = false
}

function onWheelToggle(e: WheelEvent) {
  if (!props.toggleOnWheel) {
    return
  }

  const valueSource = props.direction === 'horizontal' ? e.deltaX : e.deltaY
  const delta = valueSource > 0 ? 1 : -1

  const oldIndex = internalIndex.value
  onToggleClick(delta)

  if (internalIndex.value !== oldIndex) {
    e.preventDefault()
    e.stopPropagation()
  }
}

function onTransitionEnd() {
  if (!disableTransition.value) {
    return
  }

  resetContainerPosition()
}

function registerCarousel(state: CarouselItemState) {
  slides.value.push(state)
}

function unregisterCarousel(id: string) {
  slides.value = slides.value.filter(slide => slide.id !== id)
}

onBeforeUnmount(() => {
  slides.value = []
})

provide(carouselGroupContextKey, {
  props,
  slides,
  registerCarousel,
  unregisterCarousel,
})
</script>

<template>
  {{ internalIndex }}

  <div class="pxd-carousel-group group/carousel w-full relative overflow-hidden" @wheel="onWheelToggle">
    <template v-if="arrow">
      <button
        class="pxd-carousel-group--prev-button z-10 appearance-none absolute top-1/2 p-2 rounded-full bg-gray-alpha-200 -translate-y-1/2 opacity-0 cursor-pointer left-0 -translate-x-full disabled:pointer-events-none group-hover/carousel:translate-x-1/2 group-hover/carousel:opacity-40 hover:opacity-80 active:opacity-100 motion-safe:transition-all"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>
      <button
        class="pxd-carousel-group--next-button z-10 appearance-none absolute top-1/2 p-2 rounded-full bg-gray-alpha-200 -translate-y-1/2 opacity-0 cursor-pointer right-0 translate-x-full disabled:pointer-events-none group-hover/carousel:-translate-x-1/2 group-hover/carousel:opacity-40 hover:opacity-80 active:opacity-100 motion-safe:transition-all"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon />
      </button>
    </template>

    <div
      ref="containerRef"
      class="pxd-carousel-group--container w-full flex h-(--h) transition-transform duration-500 translate-z-0 group-hover/carousel:will-change-transform"
      :style="computedStyle"
      @transitionend="onTransitionEnd"
    >
      <slot />
    </div>
  </div>
</template>
