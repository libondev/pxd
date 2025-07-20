<script lang="ts" setup>
import type { CarouselGroupProps, CarouselItemState } from './constants'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { provideCarouselGroupContext } from '../../contexts/carousel'
import { throttle } from '../../utils/fn'
import { getCssUnitValue } from '../../utils/format'
import { THROTTLE_DELAY, TRANSITION_CLASSES } from './constants'

defineOptions({
  name: 'PCarouselGroup',
})

const props = withDefaults(
  defineProps<CarouselGroupProps>(),
  {
    index: 0,
    loop: true,
    arrow: true,
    height: 180,
    autoplay: true,
    interval: 3000,
    indicator: true,
    indicatorType: 'line',
    indicatorPosition: 'bottom',
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

function onIndicatorClick(ev: MouseEvent) {
  const target = ev.target as HTMLButtonElement
  const targetIndex = Number(target.dataset.index)

  virtualIndex.value = targetIndex
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

provideCarouselGroupContext({
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
})
</script>

<template>
  <div
    tabindex="-1"
    :data-direction="direction"
    :data-indicator-type="indicatorType"
    :data-indicator-position="indicatorPosition"
    class="pxd-carousel-group group w-full relative overflow-hidden touch-manipulation"
    :style="{ height: getCssUnitValue(height) }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div
      ref="containerRef"
      class="pxd-carousel-group--container w-full h-full translate-z-0 group-data-[direction=horizontal]:flex group-hover:will-change-transform"
      :style="computedStyle"
      :class="TRANSITION_CLASSES"
      @transitionend="onTransitionsEnd"
    >
      <slot />
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel-group--indicator absolute w-max flex items-center gap-2 group-data-[indicator-position=left]:flex-col group-data-[indicator-position=right]:flex-col"
      @click="onIndicatorClick"
    >
      <button
        v-for="(_, i) in carousels.length"
        :key="i"
        :data-index="i"
        class="pxd-carousel-group--indicator-item w-(--w) h-(--h) relative rounded-full appearance-none cursor-pointer outline-none bg-gray-alpha-200 motion-safe:transition-colors hover:bg-gray-alpha-400"
        :class="{ '!bg-primary': i === correctIndex }"
      />
    </div>

    <div v-if="arrow" class="pxd-carousel-group--toggle-buttons flex gap-2 absolute group-data-[indicator-position=left]:flex-col group-data-[indicator-position=right]:flex-col">
      <button
        type="button"
        aria-label="Carousel arrow left"
        class="pxd-carousel-group--prev-button group-data-[direction=vertical]:rotate-90 appearance-none p-1.5 rounded-md bg-gray-alpha-200 cursor-pointer disabled:pointer-events-none opacity-40 hover:opacity-100 active:bg-gray-alpha-400 motion-safe:transition-colors"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        class="pxd-carousel-group--next-button group-data-[direction=vertical]:rotate-90 appearance-none p-1.5 rounded-md bg-gray-alpha-200 cursor-pointer disabled:pointer-events-none opacity-40 hover:opacity-100 active:bg-gray-alpha-400 motion-safe:transition-colors"
        @click="onToggleClick(1)"
      >
        <ChevronRightIcon />
      </button>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-carousel-group {
  &[data-indicator-type="dot"] {
    --w: 8px;
    --h: 8px;
  }

  &[data-indicator-type="line"] {
    &[data-indicator-position="top"],
    &[data-indicator-position="bottom"] {
      --w: 16px;
      --h: 4px;
    }

    &[data-indicator-position="left"],
    &[data-indicator-position="right"] {
      --w: 4px;
      --h: 16px;
    }
  }

  &[data-indicator-position="top"] {
    .pxd-carousel-group--indicator {
      left: 12px;
      top: 8px;
    }

    .pxd-carousel-group--toggle-buttons {
      right: 8px;
      top: 8px;
    }
  }

  &[data-indicator-position="bottom"] {
    .pxd-carousel-group--indicator {
      left: 12px;
      bottom: 8px;
    }

    .pxd-carousel-group--toggle-buttons {
      right: 8px;
      bottom: 8px;
    }
  }

  &[data-indicator-position="left"] {
    .pxd-carousel-group--indicator {
      left: 8px;
      top: 12px;
    }

    .pxd-carousel-group--toggle-buttons {
      left: 8px;
      bottom: 8px;
    }
  }

  &[data-indicator-position="right"] {
    .pxd-carousel-group--indicator {
      right: 8px;
      top: 12px;
    }

    .pxd-carousel-group--toggle-buttons {
      right: 8px;
      bottom: 8px;
    }
  }
}

.pxd-carousel-group--indicator-item::before {
  content: '';
  position: absolute;
  inset: -4px;
}
</style>
