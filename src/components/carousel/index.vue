<script lang="ts" setup>
import type { CarouselMove } from '../../composables/use-carousel.js'
import type { CarouselEmits, CarouselProps } from './types'
import type { CSSProperties } from 'vue'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, shallowRef, useSlots } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetails } from '../../composables/_internal/use-change-details.js'
import { useSwipeGesture } from '../../composables/_internal/use-swipe-gesture.js'
import { useCarousel } from '../../composables/use-carousel.js'
import { awaitAnimationEnd } from '../../utils/dom.js'
import { getCssUnitValue } from '../../utils/format.js'

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
  indicatorPosition: 'center',
  options: () => [],
})

const emits = defineEmits<CarouselEmits>()

let maxDrag = 0

const sliderRef = shallowRef<HTMLElement>()
const virtualIndex = shallowRef(props.index)
const gestureMoveOffset = shallowRef(0)

const slideCount = computed(() => props.options.length)
const isHorizontal = computed(() => props.direction === 'horizontal')
const computedStyle = computed(() => {
  const translateValue = `calc(${virtualIndex.value * -100}% + ${gestureMoveOffset.value}px)`

  return {
    transform: `translate${isHorizontal.value ? 'X' : 'Y'}(${translateValue})`,
  }
})

const rootStyle = computed<CSSProperties>(() => {
  return {
    height: getCssUnitValue(props.height),
    '--carousel-item-count': slideCount.value,
    '--carousel-progress-duration': `${props.interval}ms`,
  }
})

const loopPlacement = computed(() => {
  const length = slideCount.value
  const lastIndex = length - 1

  if (!props.loop || length <= 1) {
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

const notify = useAgentChange(emits)
const {
  index: currentIndex,
  isAtFirst,
  isAtLast,
  isAutoPlayPaused,
  progressKey,
  next,
  prev,
  goTo,
  pause,
  resume,
} = useCarousel({
  count: () => slideCount.value,
  defaultIndex: props.index,
  loop: () => props.loop,
  autoplay: () => props.autoplay,
  interval: () => props.interval,
  transition: animateMove,
  onChange: (index) => notify(index, changeDetails()),
})
const slots = useSlots()

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
      void (direction === 'left' ? next() : prev())
    } else {
      void (direction === 'top' ? next() : prev())
    }
  },
})
useAgentNode({
  name: 'carousel',
  items: () =>
    optionItems(
      props.options.map((option, index) => ({ label: option.label, value: index })),
      currentIndex.value,
    ),
  state: () => ({
    index: currentIndex.value,
    count: slideCount.value,
    paused: isAutoPlayPaused.value,
  }),
  actions: {
    next,
    previous: prev,
    goTo,
    play: resume,
    pause,
  },
})

async function animateMove(move: CarouselMove) {
  const el = sliderRef.value

  if (!el) {
    return
  }

  if (!move.wrapped) {
    virtualIndex.value = move.to

    await nextTick()
    await awaitAnimationEnd(el)

    return
  }

  virtualIndex.value = move.from + move.direction

  await nextTick()
  await awaitAnimationEnd(el)

  el.style.transition = 'none'
  virtualIndex.value = move.to

  await nextTick()
  void el.offsetHeight
  el.style.transition = ''
}
function onWheelToggle(ev: WheelEvent) {
  if (!props.toggleOnWheel) {
    return
  }

  if (slideCount.value <= 1) {
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

  void (delta > 0 ? next() : prev())
}

function onPointerEnter() {
  if (props.pauseOnHover) {
    pause()
  }
}

function onPointerLeave() {
  resume()
}

function onIndicatorClick(ev: MouseEvent) {
  const targetEl = (ev.target as HTMLElement).closest('[data-index]') as HTMLButtonElement | null
  const targetIndex = Number(targetEl?.dataset.index)

  if (Number.isNaN(targetIndex)) {
    return
  }

  if (targetIndex !== currentIndex.value) {
    void goTo(targetIndex)
  }
}
</script>

<template>
  <div
    data-carousel
    v-bind="$attrs"
    :data-orientation="direction"
    :data-autoplay="autoplay"
    :data-autoplay-paused="isAutoPlayPaused || undefined"
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
        <template v-for="(option, index) in options" :key="option.value || index">
          <div
            class="pxd-carousel-item size-full shrink-0 content-visibility-auto intrinsic-size-auto"
          >
            <slot v-if="slots.item" name="item" :item="option" :index="index" />
            <template v-else>{{ option.label }}</template>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="indicator"
      class="pxd-carousel--indicator gap-2 absolute z-1 flex w-max items-center"
      @click="onIndicatorClick"
    >
      <slot name="indicator" :current="currentIndex" :total="slideCount">
        <button
          v-for="(_, i) in slideCount"
          :key="i"
          :data-index="i"
          class="pxd-carousel--indicator-item h-2 relative cursor-pointer appearance-none rounded-full bg-gray-alpha-200 font-inherit self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-[width,background-color]"
          :class="i === currentIndex ? 'w-8' : 'w-2'"
        >
          <span
            v-if="i === currentIndex"
            :key="progressKey"
            class="pxd-carousel--indicator-progress block h-full rounded-full bg-primary"
          />
        </button>
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel--toggler gap-2 pointer-events-none absolute z-1 flex">
      <button
        type="button"
        aria-label="Carousel arrow left"
        :disabled="!loop && isAtFirst"
        class="pxd-carousel--prev-btn p-1.5 pointer-events-auto cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none enabled:hover:bg-background-hover enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
        @click="prev()"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        aria-label="Carousel arrow right"
        :disabled="!loop && isAtLast"
        class="pxd-carousel--next-btn p-1.5 pointer-events-auto cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none enabled:hover:bg-background-hover enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
        @click="next()"
      >
        <ChevronRightIcon />
      </button>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-carousel {
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

  &[data-autoplay='false'] .pxd-carousel--indicator-progress {
    width: 100%;
    animation: none;
  }

  &[data-autoplay='false'] .pxd-carousel--indicator-progress,
  &[data-autoplay-paused] .pxd-carousel--indicator-progress {
    animation-play-state: paused;
  }
}

.pxd-carousel--indicator-item::before {
  content: '';
  position: absolute;
  inset: -0.25rem;
}

.pxd-carousel--indicator-progress {
  width: 0;
  animation: pxd-carousel-indicator-progress var(--carousel-progress-duration) linear forwards;
}

@keyframes pxd-carousel-indicator-progress {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}
</style>
