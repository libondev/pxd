<script lang="ts" setup>
import type { CarouselGroupProps, CarouselItemState } from './constants'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'
import { throttle } from '../../utils/fn'
import { getCssUnitValue } from '../../utils/format'
import { carouselGroupContextKey, THROTTLE_DELAY, TRANSITION_CLASSES } from './constants'

defineOptions({
  name: 'PCarouselGroup',
})

const props = withDefaults(
  defineProps<CarouselGroupProps>(),
  {
    index: 0,
    loop: true,
    arrow: true,
    height: 150,
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

let autoPlayTimer: ReturnType<typeof requestAnimationFrame>

const containerRef = shallowRef<HTMLDivElement>()

const carousels = ref<CarouselItemState[]>([])

const virtualIndex = shallowRef(props.index)

// 由于虚拟索引可能超出范围以便于实现无缝切换，需要一个处理边界的索引来指示真实索引
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
    transform: props.direction === 'horizontal'
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

const onToggleClick = throttle((delta: number) => {
  const length = carousels.value.length

  if (length === 0) {
    return
  }

  if (props.loop) {
    virtualIndex.value += delta

    translateItems()
  } else {
    virtualIndex.value = Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
  }

  emits('change', correctIndex.value)
}, THROTTLE_DELAY, { leading: true, trailing: false })

function onWheelToggle(ev: WheelEvent) {
  if (!props.toggleOnWheel) {
    return
  }

  const delta = ev.deltaY > 0 ? 1 : -1

  onToggleClick(delta)

  const index = virtualIndex.value

  if (!props.loop && (index !== 0 && index !== carousels.value.length - 1)) {
    ev.preventDefault()
  }
}

// 禁用过渡效果，并重置索引以复位容器
function resetContainerPosition(resetIndex: number) {
  const containerClassList = containerRef.value!.classList

  containerClassList.remove(...TRANSITION_CLASSES)

  virtualIndex.value = resetIndex
  translateItems()

  setTimeout(() => {
    containerClassList.add(...TRANSITION_CLASSES)
  }, 0)
}

function onTransitionsEnd() {
  if (!props.loop) {
    return
  }

  if (virtualIndex.value >= carousels.value.length) {
    resetContainerPosition(0)
  } else if (virtualIndex.value <= -1) {
    resetContainerPosition(carousels.value.length - 1)
  }
}

function setAutoPlayTimer() {
  const startTime = performance.now()

  function onAnimationFrame() {
    const currentTime = performance.now()
    const elapsedTime = currentTime - startTime

    if (elapsedTime >= props.interval) {
      onToggleClick(1)
      setAutoPlayTimer()
    } else {
      autoPlayTimer = requestAnimationFrame(onAnimationFrame)
    }
  }

  autoPlayTimer = requestAnimationFrame(onAnimationFrame)
}

function onPointerEnter() {
  cancelAnimationFrame(autoPlayTimer)
}

function onPointerLeave() {
  if (!props.autoplay) {
    return
  }

  setAutoPlayTimer()
}

function registerCarousel(state: CarouselItemState) {
  carousels.value.push(state)
}

function unregisterCarousel(id: string) {
  carousels.value = carousels.value.filter(({ uid }) => uid !== id)
}

onMounted(() => {
  onPointerLeave()
})

onBeforeUnmount(() => {
  carousels.value = []
})

provide(carouselGroupContextKey, {
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
})
</script>

<template>
  <div
    tabindex="-1"
    class="pxd-carousel-group group w-full relative overflow-hidden touch-manipulation"
    :style="{ height: getCssUnitValue(height) }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div
      ref="containerRef"
      :data-direction="direction"
      class="pxd-carousel-group--container w-full h-full translate-z-0 data-[direction=horizontal]:flex group-hover:will-change-transform"
      :style="computedStyle"
      :class="TRANSITION_CLASSES"
      @transitionend="onTransitionsEnd"
    >
      <slot />
    </div>

    <template v-if="arrow">
      <button
        type="button"
        aria-label="Carousel arrow left"
        class="pxd-carousel-group--prev-button z-10 appearance-none absolute top-1/2 p-2 rounded-full bg-gray-alpha-200 -translate-y-1/2 opacity-0 cursor-pointer left-0 -translate-x-full disabled:pointer-events-none group-hover:translate-x-1/2 group-hover:opacity-50 group-focus-within:translate-x-1/2 group-focus-within:opacity-50 hover:opacity-100 active:bg-gray-alpha-400 motion-safe:transition-all"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        class="pxd-carousel-group--next-button z-10 appearance-none absolute top-1/2 p-2 rounded-full bg-gray-alpha-200 -translate-y-1/2 opacity-0 cursor-pointer right-0 translate-x-full disabled:pointer-events-none group-hover:-translate-x-1/2 group-hover:opacity-50 group-focus-within:-translate-x-1/2 group-focus-within:opacity-50 hover:opacity-100 active:bg-gray-alpha-400 motion-safe:transition-all"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon />
      </button>
    </template>
  </div>
</template>
