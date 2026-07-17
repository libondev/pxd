<script lang="ts" setup>
import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { BubbleGroupProps } from './types'
import { nextTick, onBeforeUnmount, onMounted, onUpdated, shallowRef, watch } from 'vue'
import { useVirtualList } from '../../composables/use-virtual-list'
import { on, off } from '../../utils/event'
import { isServer } from '../../utils/is'
import PBacktop from '../backtop/index.vue'

defineOptions({
  name: 'PBubbleGroup',
  inheritAttrs: false,
})

const props = defineProps<BubbleGroupProps>()

const isAtBottom = shallowRef(true)
const containerRef = shallowRef<HTMLElement>()

const BOTTOM_THRESHOLD = 8

const { totalSize, virtualItems, measureElement } = useVirtualList(
  containerRef,
  props as unknown as VirtualListOptions,
)

function updateIsAtBottom() {
  const el = containerRef.value

  if (!el) {
    return
  }

  const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
  isAtBottom.value = distanceToBottom <= BOTTOM_THRESHOLD
}

async function scrollToBottom() {
  const el = containerRef.value

  if (!el) {
    return
  }

  if (!isAtBottom.value) {
    return
  }

  await nextTick()

  el.scrollTo(0, el.scrollHeight)
}

watch(
  () => props.listData?.length,
  (newLen, oldLen) => {
    if (!props.listData || !newLen || !oldLen) {
      return
    }

    if (newLen > oldLen && isAtBottom.value) {
      scrollToBottom()
    }
  },
)

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

onUpdated(() => {
  if (isServer()) {
    return
  }

  if (!props.listData) {
    scrollToBottom()
  }
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
    class="pxd-bubble-group relative overflow-x-hidden overflow-y-auto"
    v-bind="$attrs"
  >
    <template v-if="listData">
      <div
        class="pxd-bubble-group--content relative w-full content-visibility-auto"
        :style="{ height: `${totalSize}px`, containIntrinsicSize: `auto ${totalSize}px` }"
      >
        <div
          v-for="virtualItem in virtualItems"
          :key="virtualItem.key"
          :ref="(el: any) => measureElement(el)"
          :data-index="virtualItem.index"
          class="pxd-bubble-group--item [&+&]:pt-2 left-0 top-0 absolute w-full"
          :style="{ transform: `translateY(${virtualItem.start}px)` }"
        >
          <slot name="item" :item="listData[virtualItem.index]" :index="virtualItem.index" />
        </div>
      </div>
    </template>

    <slot v-else />

    <div class="pxd-bubble-group--action bottom-0 h-0 sticky">
      <PBacktop
        class="bottom-1 shadow-sm left-1/2 z-1 w-max -translate-x-1/2 rounded-full"
        scroll-target="bottom"
        :append-to-body="false"
        scroll-behavior="instant"
      />
    </div>
  </div>
</template>
