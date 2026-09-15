<script lang="ts" setup>
import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { BubbleGroupProps } from './types'
import { nextTick, onMounted, shallowRef, watch } from 'vue'
import { useStickToBottom } from '../../composables/use-stick-to-bottom.js'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import PBacktop from '../backtop/index.vue'

defineOptions({
  name: 'PBubbleGroup',
  inheritAttrs: false,
})

const props = defineProps<BubbleGroupProps>()

const containerRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const { totalSize, virtualItems, measureElement } = useVirtualList(
  containerRef,
  props as unknown as VirtualListOptions,
)

const { stickIfNeeded, forceStickToBottom } = useStickToBottom(containerRef, contentRef, {
  threshold: 8,
})

watch(
  () => props.listData?.length,
  (newLen, oldLen) => {
    if (!props.listData || !newLen || !oldLen || newLen <= oldLen) {
      return
    }

    void nextTick(() => {
      stickIfNeeded()
    })
  },
)

onMounted(() => {
  forceStickToBottom()
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
        ref="contentRef"
        class="pxd-bubble-group--content relative w-full content-visibility-auto"
        :style="{ height: `${totalSize}px`, containIntrinsicSize: `auto ${totalSize}px` }"
      >
        <div
          v-for="virtualItem in virtualItems"
          :key="virtualItem.key"
          :ref="(el: any) => measureElement(el)"
          :data-index="virtualItem.index"
          class="pxd-bubble-group--item sibling:pbs-2 left-0 top-0 absolute w-full"
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
