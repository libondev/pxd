<script lang="ts" setup>
import type { CarouselState } from '../../contexts/carousel'
import type { CarouselGroupProps } from '../../types/components/carousel'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { provideCarouselGroupContext } from '../../contexts/carousel'
import { getCssUnitValue } from '../../utils/format'
import { throttle } from '../../utils/throttle'

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

const THROTTLE_INTERVALS = 550 // 比过渡事件稍长以预留给容器重置位置的时间
const TRANSITION_CLASSES = ['transition-transform', 'duration-500']

let autoPlayTimer: ReturnType<typeof requestAnimationFrame>

const sliderRef = shallowRef<HTMLDivElement>()

const carousels = ref<CarouselState[]>([])

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

  onPointerEnter()
  if (props.loop) {
    virtualIndex.value += delta

    translateItems()
  } else {
    virtualIndex.value = Math.max(0, Math.min(virtualIndex.value + delta, length - 1))
  }

  nextTick(onPointerLeave)
  emits('change', correctIndex.value)
}, THROTTLE_INTERVALS, { edges: ['leading'] })

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
  const containerClassList = sliderRef.value!.classList

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
  // 键盘导航的时候鼠标可能不会触发 pointerenter
  // 所以在切换的时候清空自动播放定时器
  onPointerEnter()

  const target = ev.target as HTMLButtonElement
  const targetIndex = Number(target.dataset.index)

  if (Number.isNaN(targetIndex)) {
    return
  }

  virtualIndex.value = targetIndex

  nextTick(onPointerLeave)
}

function registerCarousel(state: CarouselState) {
  carousels.value.push(state)
}

function unregisterCarousel(id: string) {
  carousels.value = carousels.value.filter(({ uid }) => uid !== id)
}

provideCarouselGroupContext({
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
})

onMounted(() => {
  onPointerLeave()
})

onBeforeUnmount(() => {
  carousels.value = []
})
</script>

<template>
  <div
    tabindex="-1"
    :data-direction="direction"
    :data-indicator-type="indicatorType"
    :data-indicator-position="indicatorPosition"
    class="pxd-carousel-group group relative w-full touch-manipulation overflow-hidden"
    :style="{ height: getCssUnitValue(height) }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheelToggle"
  >
    <div class="pxd-carousel-group--container size-full">
      <div
        ref="sliderRef"
        class="pxd-carousel-group--slider translate-z-0 size-full group-hover:will-change-transform group-data-[direction=horizontal]:flex"
        :style="computedStyle"
        :class="TRANSITION_CLASSES"
        @transitionend="onTransitionsEnd"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel-group--indicator gap-2 absolute flex w-max items-center group-data-[indicator-position=left]:flex-col group-data-[indicator-position=right]:flex-col"
      @click="onIndicatorClick"
    >
      <slot name="indicator" :current="correctIndex + 1" :total="carousels.length">
        <button
          v-for="(_, i) in carousels.length"
          :key="i"
          :data-index="i"
          class="pxd-carousel-group--indicator-item relative h-(--h) w-(--w) cursor-pointer appearance-none rounded-full bg-gray-alpha-200 self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-colors"
          :class="{ '!bg-primary': i === correctIndex }"
        />
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel-group--toggle-buttons gap-2 absolute flex group-data-[indicator-position=left]:flex-col group-data-[indicator-position=right]:flex-col">
      <button
        type="button"
        aria-label="Carousel arrow left"
        class="pxd-carousel-group--prev-button p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 text-foreground-secondary self-focus-ring outline-none group-data-[direction=vertical]:rotate-90 hover:bg-background-hover active:bg-background-active disabled:pointer-events-none motion-safe:transition-colors"
        @click="onToggleClick(-1)"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        class="pxd-carousel-group--next-button p-1.5 cursor-pointer appearance-none rounded-md bg-gray-alpha-100 text-foreground-secondary self-focus-ring outline-none group-data-[direction=vertical]:rotate-90 hover:bg-background-hover active:bg-background-active disabled:pointer-events-none motion-safe:transition-colors"
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
