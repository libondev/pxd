<script lang="ts" setup>
import type { ChangeReason } from '../../types/shared/change'
import type { CarouselEmits, CarouselMove, CarouselProps } from './types'
import type { CSSProperties } from 'vue'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, shallowRef, useSlots, watch } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useSwipeGesture } from '../../composables/_internal/use-swipe-gesture.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { awaitAnimationEnd } from '../../utils/dom.js'
import { clampValue, getCssUnitValue } from '../../utils/format.js'
import { isServer } from '../../utils/is.js'

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
let timer: ReturnType<typeof setTimeout> | null = null
let deadline = 0
let remaining = 0
let queue: Promise<unknown> = Promise.resolve()
let stopped = false
let pendingCycle = false

const rootRef = shallowRef<HTMLElement>()
const sliderRef = shallowRef<HTMLElement>()
const virtualIndex = shallowRef(0)
const gestureMoveOffset = shallowRef(0)
const isPointerInside = shallowRef(false)
const isFocusInside = shallowRef(false)
const currentIndex = shallowRef(0)
const isAutoPlayPaused = shallowRef(false)
const progressKey = shallowRef(0)
const progressElapsed = shallowRef(0)

const slideCount = computed(() => props.options.length)
const isHorizontal = computed(() => props.direction === 'horizontal')
const isVerticalIndicator = computed(
  () => props.indicatorPosition === 'left' || props.indicatorPosition === 'right',
)
const isAtFirst = computed(() => currentIndex.value === 0)
const isAtLast = computed(() => currentIndex.value === slideCount.value - 1)
const sliderStyle = computed(() => {
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
    '--carousel-progress-elapsed': `${-progressElapsed.value}ms`,
  }
})

const loopPlacement = computed(() => {
  const count = slideCount.value

  if (!props.loop || count <= 1) {
    return 'none'
  }

  if (virtualIndex.value <= 0) {
    return 'start'
  }

  return virtualIndex.value >= count - 1 ? 'end' : 'none'
})

const slots = useSlots()
const configProvider = useConfigProvider()
const notify = useAgentChange(emits)

useSwipeGesture(sliderRef, {
  axis: () => props.direction,
  // Hover and focus own the paused state: a drag that ends must not restart autoplay while the
  // pointer is still over the carousel.
  onPress: ({ size }) => {
    maxDrag = size
    gestureMoveOffset.value = 0
  },
  onFollow: (ev) => {
    if (!canStep(ev.delta > 0 ? -1 : 1)) {
      return
    }

    gestureMoveOffset.value = clampValue(ev.displacement, -maxDrag, maxDrag)
  },
  onRelease: ({ swiped, direction }) => {
    gestureMoveOffset.value = 0

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
    next: () => next('api'),
    previous: () => prev('api'),
    goTo: (index) => goTo(Number(index), 'api'),
    play: resume,
    pause,
  },
})

function setIndex(value: number, reason: ChangeReason): void {
  currentIndex.value = value
  notify(value, changeDetailsFor({ reason }))
  startCycle()
}

function normalizeIndex(value: number): number {
  const count = slideCount.value

  if (count === 0) {
    return 0
  }

  const target = Math.floor(value)

  return props.loop ? ((target % count) + count) % count : clampValue(target, 0, count - 1)
}

// Whether a step in `direction` stays inside the slides without wrapping.
function canStep(direction: 1 | -1): boolean {
  return props.loop || !(direction > 0 ? isAtLast.value : isAtFirst.value)
}

function enqueue(task: () => Promise<number | null>): Promise<number | null> {
  const result = queue.then(task)

  queue = result.catch(() => null)

  return result
}

async function step(direction: 1 | -1, reason: ChangeReason): Promise<number | null> {
  const count = slideCount.value

  if (count <= 1 || !canStep(direction)) {
    return null
  }

  const from = currentIndex.value
  const raw = from + direction
  const wrapped = raw < 0 || raw >= count
  const to = wrapped ? (raw + count) % count : raw

  await animateMove({ from, to, direction, wrapped })
  setIndex(to, reason)

  return to
}

function next(reason: ChangeReason = 'item-press'): Promise<number | null> {
  return enqueue(() => step(1, reason))
}

function prev(reason: ChangeReason = 'item-press'): Promise<number | null> {
  return enqueue(() => step(-1, reason))
}

function goTo(target: number, reason: ChangeReason = 'item-press'): Promise<number | null> {
  return enqueue(async () => {
    const from = currentIndex.value
    const to = normalizeIndex(target)

    if (to === from) {
      return from
    }

    await animateMove({ from, to, direction: to > from ? 1 : -1, wrapped: false })
    setIndex(to, reason)

    return to
  })
}

function clearTimer(): void {
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
}

function canAutoPlay(): boolean {
  return !stopped && !isServer() && !isAutoPlayPaused.value && props.autoplay
}

function schedule(ms: number): void {
  deadline = Date.now() + ms
  timer = setTimeout(() => {
    timer = null

    void next('sync').finally(() => {
      if (timer === null && canAutoPlay()) {
        startCycle()
      }
    })
  }, ms)
}

// One cycle is the wait between two automatic advances; the indicator bar covers exactly it.
function startCycle(): void {
  clearTimer()
  remaining = Math.max(0, props.interval)

  if (!canAutoPlay()) {
    // Nothing runs while paused, so the bar keeps what it had and the cycle starts on resume.
    pendingCycle = true

    return
  }

  pendingCycle = false
  progressElapsed.value = 0
  progressKey.value++
  schedule(remaining)
}

function pause(): void {
  if (isAutoPlayPaused.value) {
    return
  }

  isAutoPlayPaused.value = true
  clearTimer()

  // Read the clock, not the timer: a cycle whose timer has just fired is still in flight, and the
  // bar has to freeze at the progress it reached instead of restarting empty.
  remaining = Math.max(0, deadline - Date.now())
  // Re-render the bar at the frozen progress instead of shifting a running animation.
  progressElapsed.value = Math.max(0, props.interval) - remaining
  progressKey.value++
}

function resume(): void {
  if (!isAutoPlayPaused.value) {
    return
  }

  isAutoPlayPaused.value = false

  if (!canAutoPlay()) {
    return
  }

  if (pendingCycle) {
    pendingCycle = false
    progressElapsed.value = 0
  }

  progressKey.value++
  schedule(remaining)
}

function stop(): void {
  stopped = true
  clearTimer()
}

async function animateMove({ from, to, direction, wrapped }: CarouselMove) {
  const el = sliderRef.value

  if (!el) {
    return
  }

  // A wrap steps one slide further in the same direction, then jumps back without a transition.
  virtualIndex.value = wrapped ? from + direction : to

  await nextTick()
  await awaitAnimationEnd(el)

  if (!wrapped) {
    return
  }

  el.style.transition = 'none'
  virtualIndex.value = to

  await nextTick()
  void el.offsetHeight
  el.style.transition = ''
}

function onWheelToggle(ev: WheelEvent) {
  if (!props.toggleOnWheel) {
    return
  }

  const delta = ev.deltaY > 0 ? 1 : -1

  if (slideCount.value <= 1 || !canStep(delta)) {
    return
  }

  if (ev.cancelable) {
    ev.preventDefault()
  }

  void (delta > 0 ? next() : prev())
}

function syncAutoPlay() {
  if (isFocusInside.value || (isPointerInside.value && props.pauseOnHover)) {
    pause()

    return
  }

  resume()
}

function onPointerEnter() {
  isPointerInside.value = true
  syncAutoPlay()
}

function onPointerLeave() {
  isPointerInside.value = false
  syncAutoPlay()
}

// A focused slide must be the one on screen: the slides are moved by transform, so the browser
// cannot scroll it into view the way it does inside a scroll container.
function onFocusIn(ev: FocusEvent) {
  isFocusInside.value = true
  syncAutoPlay()

  const slide = (ev.target as HTMLElement | null)?.closest<HTMLElement>('.pxd-carousel-item')

  if (!slide || !sliderRef.value || slide.parentElement !== sliderRef.value) {
    return
  }

  const index = Array.from(sliderRef.value.children).indexOf(slide)

  if (index !== -1 && index !== currentIndex.value) {
    void goTo(index)
  }
}

function onFocusOut(ev: FocusEvent) {
  const related = ev.relatedTarget

  if (related instanceof Node && rootRef.value?.contains(related)) {
    return
  }

  isFocusInside.value = false
  syncAutoPlay()
}

watch(slideCount, (count) => {
  const last = Math.max(0, count - 1)

  currentIndex.value = count === 0 ? 0 : clampValue(currentIndex.value, 0, last)
  virtualIndex.value = clampValue(virtualIndex.value, 0, last)
})

watch([() => props.autoplay, () => props.interval], startCycle)

currentIndex.value = normalizeIndex(props.index)
virtualIndex.value = currentIndex.value
startCycle()

onBeforeUnmount(stop)
</script>

<template>
  <div
    ref="rootRef"
    data-carousel
    v-bind="$attrs"
    role="group"
    aria-roledescription="carousel"
    :data-orientation="direction"
    :data-autoplay="autoplay"
    :data-autoplay-paused="isAutoPlayPaused || undefined"
    :data-indicator-position="indicatorPosition"
    :data-loop-placement="loopPlacement"
    class="pxd-carousel group relative w-full touch-none overflow-hidden"
    :style="rootStyle"
    @pointerenter="onPointerEnter"
    @pointerdown="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @wheel="onWheelToggle"
  >
    <div class="pxd-carousel--container size-full overflow-clip">
      <div
        ref="sliderRef"
        class="pxd-carousel--slider translate-z-0 size-full active:transition-none motion-safe:transition-transform"
        :style="sliderStyle"
      >
        <template v-for="(option, index) in options" :key="option.value || index">
          <div
            role="group"
            aria-roledescription="slide"
            :aria-label="`${index + 1} / ${slideCount}`"
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
    >
      <slot name="indicator" :current="currentIndex" :total="slideCount">
        <button
          v-for="(_, i) in slideCount"
          :key="i"
          type="button"
          :data-index="i"
          :aria-label="`${i + 1} / ${slideCount}`"
          :aria-current="i === currentIndex ? 'true' : undefined"
          class="pxd-carousel--indicator-item relative cursor-pointer appearance-none rounded-full bg-gray-alpha-200 font-inherit self-focus-ring outline-none hover:bg-gray-alpha-400 motion-safe:transition-colors"
          :class="i === currentIndex ? (isVerticalIndicator ? 'h-8 w-2' : 'h-2 w-8') : 'h-2 w-2'"
          @click="goTo(i)"
        >
          <span
            v-if="i === currentIndex"
            :key="progressKey"
            class="pxd-carousel--indicator-progress block size-full rounded-full bg-primary"
          />
        </button>
      </slot>
    </div>

    <div v-if="arrow" class="pxd-carousel--toggler gap-2 pointer-events-none absolute z-1 flex">
      <button
        type="button"
        :aria-label="configProvider.locale.carousel.prev"
        :disabled="!loop && isAtFirst"
        class="pxd-carousel--prev-btn p-1.5 pointer-events-auto cursor-pointer appearance-none rounded-md bg-gray-alpha-100 font-inherit text-foreground-secondary self-focus-ring outline-none enabled:hover:bg-background-hover enabled:active:bg-background-active disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
        @click="prev()"
      >
        <ChevronRightIcon class="rotate-180" />
      </button>

      <button
        type="button"
        :aria-label="configProvider.locale.carousel.next"
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
      inset: 0.5rem auto auto 0.75rem;
    }

    .pxd-carousel--toggler {
      inset: 0.5rem 0.5rem auto auto;
    }
  }

  &[data-indicator-position='bottom'] {
    .pxd-carousel--indicator {
      inset: auto auto 0.5rem 0.75rem;
    }

    .pxd-carousel--toggler {
      inset: auto 0.5rem 0.5rem auto;
    }
  }

  &[data-indicator-position='left'] {
    .pxd-carousel--indicator {
      inset: 0.75rem auto auto 0.5rem;
    }

    .pxd-carousel--toggler {
      inset: auto auto 0.5rem 0.5rem;
    }
  }

  &[data-indicator-position='right'] {
    .pxd-carousel--indicator {
      inset: 0.75rem 0.5rem auto auto;
    }

    .pxd-carousel--toggler {
      inset: auto 0.5rem 0.5rem auto;
    }
  }

  &[data-indicator-position='center'] {
    .pxd-carousel--indicator {
      inset: auto auto 0.5rem 50%;
      transform: translateX(-50%);
    }

    .pxd-carousel--toggler {
      inset: 50% 0 auto;
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

    .pxd-carousel--indicator-progress {
      clip-path: inset(0 0 100% 0);
      animation-name: pxd-carousel-indicator-progress-block;
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
    clip-path: none;
    animation: none;
  }

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
  clip-path: inset(0 100% 0 0);
  animation: pxd-carousel-indicator-progress var(--carousel-progress-duration) linear forwards;
  animation-delay: var(--carousel-progress-elapsed, 0ms);
}

@keyframes pxd-carousel-indicator-progress {
  from {
    clip-path: inset(0 100% 0 0);
  }

  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes pxd-carousel-indicator-progress-block {
  from {
    clip-path: inset(0 0 100% 0);
  }

  to {
    clip-path: inset(0 0 0 0);
  }
}
</style>
