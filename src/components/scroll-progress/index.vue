<script lang="ts" setup>
import type { ScrollProgressEmits, ScrollProgressProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import {
  getElement,
  getScrollElement,
  getScrollListener,
  getScrollPosition,
} from '../../utils/dom.js'
import { off, on, scheduleByRaf } from '../../utils/event.js'

defineOptions({
  name: 'PScrollProgress',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollProgressProps>(), {
  scrollTarget: null,
})

const emits = defineEmits<ScrollProgressEmits>()

const scheduleUpdate = scheduleByRaf(update)
let currentListener: EventTarget | null = null

const scrollTop = shallowRef(0)
const maxScrollTop = shallowRef(0)

const percentage = computed(() => {
  if (maxScrollTop.value <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((scrollTop.value / maxScrollTop.value) * 100)))
})

const scrollElement = shallowRef<HTMLElement | null>(null)

const notify = useAgentChange(emits)
useResizeObserver(() => scrollElement.value, scheduleUpdate)

useAgentNode({
  name: 'scroll-progress',
  state: () => ({ percentage: percentage.value }),
  actions: {},
})

function update() {
  const el = scrollElement.value

  if (!el) {
    return
  }

  const { scrollTop: top, scrollHeight, clientHeight } = getScrollPosition(el)

  scrollTop.value = top
  maxScrollTop.value = Math.max(0, scrollHeight - clientHeight)
}
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
    notify(value, changeDetailsFor({ reason: 'sync' }))
  },
)

onMounted(bindListener)

onBeforeUnmount(() => {
  scheduleUpdate.cancel()
  off(currentListener, 'scroll', scheduleUpdate)
  stopListener()
})
</script>

<template>
  <span
    data-scroll-progress
    role="progressbar"
    class="pxd-scroll-progress tabular-nums"
    :aria-valuenow="percentage"
    aria-valuemin="0"
    aria-valuemax="100"
    v-bind="$attrs"
  >
    <slot :percentage="percentage">{{ percentage }}%</slot>
  </span>
</template>
