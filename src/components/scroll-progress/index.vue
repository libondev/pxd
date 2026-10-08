<script lang="ts" setup>
import type { ScrollProgressEmits, ScrollProgressProps } from './types'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
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
  const scrollElement = computed(() => {
    return getScrollElement(getElement(props.scrollTarget))
  })

  function update() {
    const { scrollTop: top, scrollHeight, clientHeight } = getScrollPosition(scrollElement.value)

    scrollTop.value = top
    maxScrollTop.value = Math.max(0, scrollHeight - clientHeight)
  }

  const scheduleUpdate = scheduleByRaf(update)

  useResizeObserver(scrollElement, scheduleUpdate)

  let currentListener: EventTarget | null = null

  const stopListener = watch(
    () => props.scrollTarget,
    () => {
      const listener = getScrollListener(getElement(props.scrollTarget))

      if (listener === currentListener) {
        return
      }

      off(currentListener, 'scroll', scheduleUpdate)

      currentListener = listener

      on(listener, 'scroll', scheduleUpdate, { passive: true })
      scheduleUpdate()
    },
    { immediate: true, flush: 'post' },
  )

  watch(
    () => percentage.value,
    (value) => {
      emits('change', value)
    },
  )

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
