<script lang="ts" setup>
import type { MarqueeEmits, MarqueeProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { caf, doubleRaf, raf } from '../../utils/event'
import { isServer } from '../../utils/is'

defineOptions({
  name: 'PMarquee',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MarqueeProps>(), {
  as: 'div',
  text: '',
  color: 'var(--color-amber-900)',
  background: 'var(--color-amber-100)',
  delay: 1,
  speed: 60,
  wrapable: false,
  scrollable: true,
})

const emits = defineEmits<MarqueeEmits>()

const wrapRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const offset = shallowRef(0)
const duration = shallowRef(0)
const isScrolling = shallowRef(false)

let wrapWidth = 0
let contentWidth = 0
let startTimer: ReturnType<typeof setTimeout>
let loopRafId = 0

function toDelay(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 1
}

function toSpeed(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 60
}

const delayMs = computed(() => toDelay(props.delay) * 1000)
const speed = computed(() => toSpeed(props.speed))

const isWrapMode = computed(() => props.wrapable && props.scrollable === false)

const rootStyle = computed(() => ({
  '--marquee-color': props.color,
  '--marquee-background': props.background,
}))

const contentStyle = computed(() => ({
  transform: offset.value ? `translateX(${offset.value}px)` : '',
  transitionDuration: `${duration.value}s`,
}))

const contentClass = computed(() => {
  if (isWrapMode.value) {
    return 'block w-full whitespace-normal break-words'
  }

  if (isScrolling.value || props.scrollable !== false) {
    return 'inline-block w-max whitespace-nowrap'
  }

  return 'block max-w-full truncate'
})

function clearTimers() {
  clearTimeout(startTimer)

  if (loopRafId) {
    caf(loopRafId)
    loopRafId = 0
  }
}

function startScroll() {
  const wrap = wrapRef.value
  const content = contentRef.value

  if (!wrap || !content) {
    return
  }

  const measuredWrapWidth = wrap.clientWidth
  const measuredContentWidth = content.scrollWidth

  if (!props.scrollable && measuredContentWidth <= measuredWrapWidth) {
    return
  }

  doubleRaf(() => {
    wrapWidth = measuredWrapWidth
    contentWidth = measuredContentWidth
    isScrolling.value = true
    offset.value = -contentWidth
    duration.value = contentWidth / speed.value
  })
}

function onTransitionEnd(event: TransitionEvent) {
  if (event.propertyName !== 'transform' || !isScrolling.value || !contentWidth) {
    return
  }

  offset.value = wrapWidth
  duration.value = 0

  loopRafId = raf(() => {
    loopRafId = doubleRaf(() => {
      offset.value = -contentWidth
      duration.value = (contentWidth + wrapWidth) / speed.value
      emits('replay')
    })
  })
}

function reset() {
  if (isServer()) {
    return
  }

  clearTimers()
  wrapWidth = 0
  contentWidth = 0
  offset.value = 0
  duration.value = 0
  isScrolling.value = false

  if (props.scrollable === false) {
    return
  }

  startTimer = setTimeout(startScroll, delayMs.value)
}

watch(
  () => [props.scrollable, props.wrapable, props.text, delayMs.value, speed.value],
  reset,
)

useResizeObserver(wrapRef, reset)

onMounted(reset)
onBeforeUnmount(clearTimers)

defineExpose({
  reset,
})
</script>

<template>
  <Component
    :is="as"
    class="pxd-marquee text-sm min-h-10 py-2 px-3 gap-2 relative flex w-full max-w-full overflow-hidden bg-(--marquee-background) text-(--marquee-color)"
    :class="isWrapMode ? 'items-start' : 'items-center'"
    :style="rootStyle"
    v-bind="$attrs"
    @click="emits('click', $event)"
  >
    <div v-if="$slots.prefix" class="pxd-marquee--prefix flex shrink-0 items-center">
      <slot name="prefix" />
    </div>

    <div ref="wrapRef" class="pxd-marquee--wrap min-w-0 flex-1 overflow-hidden">
      <div
        ref="contentRef"
        class="pxd-marquee--content transition-transform ease-linear"
        :class="contentClass"
        :style="contentStyle"
        @transitionend="onTransitionEnd"
      >
        <slot>{{ text }}</slot>
      </div>
    </div>

    <div v-if="$slots.suffix" class="pxd-marquee--suffix flex shrink-0 items-center" @click.stop>
      <slot name="suffix" />
    </div>
  </Component>
</template>
