<script lang="ts" setup>
import type { MarqueeEmits, MarqueeProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { caf, raf, throttleByRaf } from '../../utils/event'
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
  pauseOnHover: true,
})

const emits = defineEmits<MarqueeEmits>()

const wrapRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const phase = shallowRef<'idle' | 'first' | 'loop'>('idle')
const contentStyle = shallowRef<Record<string, string>>()

let wrapWidth = 0
let contentWidth = 0
let appliedSpeed = 0
let appliedDelay = 0
let restartRafId = 0

function toDelay(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 1
}

function toSpeed(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 60
}

const delaySec = computed(() => toDelay(props.delay))
const speed = computed(() => toSpeed(props.speed))

const isWrapMode = computed(() => props.wrapable && props.scrollable === false)
const isActive = computed(() => phase.value !== 'idle')

const rootStyle = computed(() => ({
  '--marquee-color': props.color,
  '--marquee-background': props.background,
}))

const contentClass = computed(() => {
  if (isWrapMode.value) {
    return 'block w-full whitespace-normal break-words'
  }

  if (isActive.value || props.scrollable !== false) {
    return 'inline-block w-max whitespace-nowrap'
  }

  return 'block max-w-full truncate'
})

function clearRestart() {
  if (restartRafId) {
    caf(restartRafId)
    restartRafId = 0
  }
}

function stopScroll() {
  clearRestart()
  phase.value = 'idle'
  contentStyle.value = undefined
  wrapWidth = 0
  contentWidth = 0
  appliedSpeed = 0
  appliedDelay = 0
}

function buildStyle(nextWrap: number, nextContent: number, nextSpeed: number, nextDelay: number) {
  return {
    '--marquee-from': `${nextWrap}px`,
    '--marquee-to': `${-nextContent}px`,
    '--marquee-first-duration': `${nextContent / nextSpeed}s`,
    '--marquee-duration': `${(nextContent + nextWrap) / nextSpeed}s`,
    '--marquee-delay': `${nextDelay}s`,
  }
}

function armFirst() {
  clearRestart()
  phase.value = 'idle'
  restartRafId = raf(() => {
    restartRafId = 0
    phase.value = 'first'
  })
}

function syncScroll(force = false) {
  if (isServer()) {
    return
  }

  if (props.scrollable === false || isWrapMode.value) {
    stopScroll()
    return
  }

  const wrap = wrapRef.value
  const content = contentRef.value

  if (!wrap || !content) {
    return
  }

  const nextWrap = wrap.clientWidth
  const nextContent = content.scrollWidth
  const nextSpeed = speed.value
  const nextDelay = delaySec.value

  if (!nextWrap || !nextContent) {
    return
  }

  const active = phase.value !== 'idle'
  const unchanged =
    !force
    && active
    && nextWrap === wrapWidth
    && nextContent === contentWidth
    && nextSpeed === appliedSpeed
    && nextDelay === appliedDelay

  if (unchanged) {
    return
  }

  const sizeChanged = nextWrap !== wrapWidth || nextContent !== contentWidth
  const shouldRestart = force || (active && sizeChanged)

  wrapWidth = nextWrap
  contentWidth = nextContent
  appliedSpeed = nextSpeed
  appliedDelay = nextDelay
  contentStyle.value = buildStyle(nextWrap, nextContent, nextSpeed, nextDelay)

  if (!active) {
    phase.value = 'first'
    return
  }

  if (!shouldRestart) {
    return
  }

  armFirst()
}

const scheduleSync = throttleByRaf(() => {
  syncScroll(false)
})

function reset() {
  if (isServer()) {
    return
  }

  scheduleSync.cancel()
  clearRestart()
  syncScroll(true)
}

function onAnimationEnd(event: AnimationEvent) {
  if (event.target !== contentRef.value || phase.value !== 'first') {
    return
  }

  phase.value = 'loop'
  emits('replay')
}

function onAnimationIteration(event: AnimationEvent) {
  if (event.target !== contentRef.value || phase.value !== 'loop') {
    return
  }

  emits('replay')
}

watch(() => [props.scrollable, props.wrapable, props.text, delaySec.value, speed.value], reset)

useResizeObserver(wrapRef, scheduleSync)

onMounted(reset)
onBeforeUnmount(() => {
  scheduleSync.cancel()
  clearRestart()
})

defineExpose({
  reset,
})
</script>

<template>
  <Component
    :is="as"
    class="pxd-marquee text-sm min-h-10 py-2 px-3 gap-2 relative flex w-full max-w-full overflow-hidden bg-(--marquee-background) text-(--marquee-color)"
    :class="isWrapMode ? 'items-start' : 'items-center'"
    :data-pause-on-hover="pauseOnHover ? 'true' : 'false'"
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
        class="pxd-marquee--content motion-reduce:animate-none!"
        :class="contentClass"
        :data-phase="phase"
        :style="contentStyle"
        @animationend="onAnimationEnd"
        @animationiteration="onAnimationIteration"
      >
        <slot>{{ text }}</slot>
      </div>
    </div>

    <div v-if="$slots.suffix" class="pxd-marquee--suffix flex shrink-0 items-center" @click.stop>
      <slot name="suffix" />
    </div>
  </Component>
</template>

<style>
.pxd-marquee--content[data-phase='first'] {
  animation: pxd-marquee-scroll-first var(--marquee-first-duration) linear var(--marquee-delay)
    forwards;
}

.pxd-marquee--content[data-phase='loop'] {
  animation: pxd-marquee-scroll-loop var(--marquee-duration) linear infinite;
}

.pxd-marquee[data-pause-on-hover='true']:hover .pxd-marquee--content[data-phase='first'],
.pxd-marquee[data-pause-on-hover='true']:hover .pxd-marquee--content[data-phase='loop'] {
  animation-play-state: paused;
}

@keyframes pxd-marquee-scroll-first {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(var(--marquee-to));
  }
}

@keyframes pxd-marquee-scroll-loop {
  from {
    transform: translateX(var(--marquee-from));
  }

  to {
    transform: translateX(var(--marquee-to));
  }
}
</style>
