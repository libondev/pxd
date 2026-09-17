<script lang="ts" setup>
import type { ScrollTextProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { throttleByRaf } from '../../utils/event'
import { getElement } from '../../utils/dom'
import { isServer } from '../../utils/is'

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

const overflowing = shallowRef(false)
const contentStyle = shallowRef<Record<string, string>>()

let wrapWidth = 0
let contentWidth = 0
let appliedSpeed = 0

function toSpeed(value: number | string | undefined) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 40
}

const speed = computed(() => toSpeed(props.speed))

function clearOverflow() {
  overflowing.value = false
  contentStyle.value = undefined
  wrapWidth = 0
  contentWidth = 0
  appliedSpeed = 0
}

function syncOverflow(force = false) {
  if (isServer()) {
    return
  }

  const wrap = getElement(wrapRef.value)
  const content = contentRef.value

  if (!wrap || !content) {
    return
  }

  const nextWrap = wrap.clientWidth
  const nextContent = content.scrollWidth
  const nextSpeed = speed.value

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
    !force
    && overflowing.value
    && nextWrap === wrapWidth
    && nextContent === contentWidth
    && nextSpeed === appliedSpeed

  if (unchanged) {
    return
  }

  wrapWidth = nextWrap
  contentWidth = nextContent
  appliedSpeed = nextSpeed
  overflowing.value = true
  contentStyle.value = {
    '--scroll-text-distance': `${distance}px`,
    '--scroll-text-duration': `${distance / nextSpeed}s`,
  }
}

const scheduleSync = throttleByRaf(() => {
  syncOverflow(false)
})

watch(() => [props.text, speed.value], () => {
  scheduleSync.cancel()
  syncOverflow(true)
})

useResizeObserver(wrapRef, scheduleSync)

onMounted(() => {
  syncOverflow(true)
})

onBeforeUnmount(() => {
  scheduleSync.cancel()
})
</script>

<template>
  <Component
    :is="as"
    ref="wrapRef"
    class="pxd-scroll-text block min-w-0 max-w-full overflow-hidden"
    :data-overflow="overflowing ? 'true' : 'false'"
    :style="contentStyle"
    v-bind="$attrs"
  >
    <span
      ref="contentRef"
      class="pxd-scroll-text--content block max-w-full truncate whitespace-nowrap motion-reduce:animate-none!"
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
