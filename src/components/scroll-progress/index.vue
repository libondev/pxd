<script lang="ts" setup>
import type { ScrollProgressEmits, ScrollProgressProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import {
  getElement,
  getScrollElement,
  getScrollListener,
  getScrollPosition,
} from '../../utils/dom.js'
import { off, on, scheduleByRaf } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'

defineOptions({
  name: 'PScrollProgress',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollProgressProps>(), {
  scrollTarget: null,
})

const emits = defineEmits<ScrollProgressEmits>()

const scrollTop = shallowRef(0)
const maxScrollTop = shallowRef(0)

const percentage = computed(() => {
  if (maxScrollTop.value <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((scrollTop.value / maxScrollTop.value) * 100)))
})

if (!isServer()) {
  const scrollElement = shallowRef<HTMLElement | null>(null)

  function update() {
    const el = scrollElement.value

    if (!el) {
      return
    }

    const { scrollTop: top, scrollHeight, clientHeight } = getScrollPosition(el)

    scrollTop.value = top
    maxScrollTop.value = Math.max(0, scrollHeight - clientHeight)
  }

  const scheduleUpdate = scheduleByRaf(update)

  useResizeObserver(() => scrollElement.value, scheduleUpdate)

  let currentListener: EventTarget | null = null

  function bindListener() {
    const el = getElement(props.scrollTarget)
    const listener = getScrollListener(el)

    scrollElement.value = getScrollElement(el)

    if (listener !== currentListener) {
      off(currentListener, 'scroll', scheduleUpdate)

      currentListener = listener

      on(listener, 'scroll', scheduleUpdate, { passive: true })
    }

    scheduleUpdate()
  }

  const stopListener = watch(() => props.scrollTarget, bindListener, { flush: 'post' })

  watch(
    () => percentage.value,
    (value) => {
      emits('change', value)
    },
  )

  onMounted(bindListener)

  onBeforeUnmount(() => {
    scheduleUpdate.cancel()
    off(currentListener, 'scroll', scheduleUpdate)
    stopListener()
  })
}
</script>

<template>
  <span
    role="progressbar"
    class="pxd-scroll-progress"
    :aria-valuenow="percentage"
    aria-valuemin="0"
    aria-valuemax="100"
    v-bind="$attrs"
  >
    <slot :percentage="percentage">{{ percentage }}%</slot>
  </span>
</template>
