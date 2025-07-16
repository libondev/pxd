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

function translateItems() {
  slides.value.forEach((carousel, index) => {
    carousel.translateItem(index, internalIndex.value)
  })
}

const onToggleClick = throttle((delta: number) => {
  const length = slides.value.length
  const maxWithVirtual = length + 1

  if (length === 0) {
    return
  }

  if (props.loop) {
    // internalIndex.value = (internalIndex.value + delta + maxWithVirtual) % maxWithVirtual
    internalIndex.value = (internalIndex.value + delta)

    translateItems()
  } else {
    internalIndex.value = Math.max(0, Math.min(internalIndex.value + delta, maxWithVirtual - 1))
  }

  emits('change', internalIndex.value >= 0 ? internalIndex.value : length - 1)
}, 0)

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
  if (internalIndex.value >= slides.value.length) {
    containerRef.value!.classList.add('\!transition-none')

    slides.value.forEach((carousel) => {
      carousel.resetPosition()
    })

    internalIndex.value = 0

    containerRef.value!.classList.remove('\!transition-none')
  }
}

function registerCarousel(state: CarouselItemState) {
  slides.value.push(state)
}

function unregisterCarousel(id: string) {
  slides.value = slides.value.filter(slide => slide.uid !== id)
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
      class="pxd-carousel-group--container w-full flex h-(--h) transition-transform translate-z-0 duration-500 group-hover/carousel:will-change-transform"
      :style="computedStyle"
      @transitionend="onTransitionEnd"
    >
      <slot />
    </div>
  </div>
</template>
