<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, onUpdated, shallowRef } from 'vue'
import { on, off } from '../../utils/event'
import { isServer } from '../../utils/is'
import PBacktop from '../backtop/index.vue'

defineOptions({
  name: 'PBubbleGroup',
  inheritAttrs: false,
})

const isAtBottom = shallowRef(true)
const containerRef = shallowRef<HTMLElement>()

const BOTTOM_THRESHOLD = 8

function updateIsAtBottom() {
  const el = containerRef.value

  if (!el) {
    return
  }

  const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
  isAtBottom.value = distanceToBottom <= BOTTOM_THRESHOLD
}

async function scrollToBottom() {
  await nextTick()

  const el = containerRef.value

  if (!el) {
    return
  }

  if (!isAtBottom.value) {
    return
  }

  el.scrollTo(0, el.scrollHeight)
}

onMounted(() => {
  if (isServer()) {
    return
  }

  if (!containerRef.value) {
    return
  }

  on(containerRef.value, 'scroll', updateIsAtBottom, { passive: true })

  scrollToBottom()
})

onUpdated(async () => {
  if (isServer()) {
    return
  }

  scrollToBottom()
})

onBeforeUnmount(() => {
  if (!containerRef.value) {
    return
  }

  off(containerRef.value, 'scroll', updateIsAtBottom, { passive: true })
})
</script>

<template>
  <div
    ref="containerRef"
    class="pxd-bubble-group max-h-40 relative overflow-x-hidden overflow-y-auto"
    v-bind="$attrs"
  >
    <slot />

    <div class="pxd-bubble-group--action bottom-0 h-0 sticky">
      <PBacktop
        class="bottom-1 shadow-sm left-1/2 z-1 w-max -translate-x-1/2 rounded-full"
        scroll-target="bottom"
        :append-to-body="false"
      />
    </div>
  </div>
</template>
