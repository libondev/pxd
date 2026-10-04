<script lang="ts" setup>
import type { ScrollTextProps } from './types'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { getElement } from '../../utils/dom.js'
import { caf, raf } from '../../utils/event.js'

defineOptions({
  name: 'PScrollText',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollTextProps>(), {
  as: 'span',
  text: '',
  speed: 40,
})

const wrapRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const contentStyle = shallowRef<Record<string, string>>()

let wrapWidth = 0
let contentWidth = 0
let appliedSpeed = 0
let initialRafId = 0

function toSpeed(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 40
}

function clearOverflow() {
  contentStyle.value = undefined
  wrapWidth = 0
  contentWidth = 0
  appliedSpeed = 0
}

function syncOverflow(force = false) {
  const wrap = getElement(wrapRef.value)
  const content = contentRef.value

  if (!wrap || !content) {
    return
  }

  const nextWrap = wrap.clientWidth
  const nextContent = content.scrollWidth
  const nextSpeed = toSpeed(props.speed)

  if (!nextWrap || !nextContent) {
    clearOverflow()
    return
  }

  const distance = nextContent - nextWrap
  const nextOverflowing = distance > 1

  if (!nextOverflowing) {
    clearOverflow()
    return
  }

  const unchanged =
    !force &&
    contentStyle.value &&
    nextWrap === wrapWidth &&
    nextContent === contentWidth &&
    nextSpeed === appliedSpeed

  if (unchanged) {
    return
  }

  wrapWidth = nextWrap
  contentWidth = nextContent
  appliedSpeed = nextSpeed
  contentStyle.value = {
    '--scroll-text-distance': `${distance}px`,
    '--scroll-text-duration': `${distance / nextSpeed}s`,
  }
}

watch(
  () => [props.text, toSpeed(props.speed)],
  () => {
    syncOverflow(true)
  },
  { flush: 'post' },
)

useResizeObserver(wrapRef, () => {
  syncOverflow(false)
})

// The first measurement is deferred to a rAF instead of running synchronously in
// the mounted queue, where a batch of instances reading layout forces one reflow
// per item. Inside a single rAF the browser resolves layout once and serves every
// instance's read from that pass, so a list costs one reflow instead of N.
// ResizeObserver's initial delivery is not relied on here: it is not guaranteed to
// land before first paint in every rendering context.
onMounted(() => {
  initialRafId = raf(() => {
    initialRafId = 0
    syncOverflow(true)
  })
})

onBeforeUnmount(() => {
  if (!initialRafId) {
    return
  }

  caf(initialRafId)
  initialRafId = 0
})
</script>

<template>
  <Component
    :is="as"
    ref="wrapRef"
    class="pxd-scroll-text min-w-0 block max-w-full overflow-hidden"
    :data-overflow="contentStyle ? 'true' : 'false'"
    :style="contentStyle"
    v-bind="$attrs"
  >
    <span
      ref="contentRef"
      class="pxd-scroll-text--content block max-w-full truncate whitespace-nowrap"
    >
      <slot>{{ text }}</slot>
    </span>
  </Component>
</template>

<style>
.pxd-scroll-text[data-overflow='true']:hover .pxd-scroll-text--content {
  display: inline-block;
  width: max-content;
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  animation: pxd-scroll-text-shift var(--scroll-text-duration) linear infinite;
}

@keyframes pxd-scroll-text-shift {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-1 * var(--scroll-text-distance)));
  }
}
</style>
