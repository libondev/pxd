<script lang="ts" setup>
import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { BubbleGroupProps } from './types'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import PBacktop from '../backtop/index.vue'
import PStickToBottom from '../stick-to-bottom/index.vue'

defineOptions({
  name: 'PBubbleGroup',
  inheritAttrs: false,
})

const props = defineProps<BubbleGroupProps>()

const stickRef = shallowRef<InstanceType<typeof PStickToBottom>>()

const { totalSize, virtualItems, measureElement } = useVirtualList(
  () => stickRef.value?.containerRef ?? null,
  props as unknown as VirtualListOptions,
)

const contentStyle = computed(() => {
  if (!props.listData) {
    return undefined
  }

  return {
    height: `${totalSize.value}px`,
    containIntrinsicSize: `auto ${totalSize.value}px`,
  }
})

watch(
  () => props.listData?.length,
  (newLen, oldLen) => {
    if (!props.listData || !newLen || !oldLen || newLen <= oldLen) {
      return
    }

    void nextTick(() => {
      stickRef.value?.stickIfNeeded()
    })
  },
)

onMounted(() => {
  stickRef.value?.forceStickToBottom()
})
</script>

<template>
  <PStickToBottom
    ref="stickRef"
    class="pxd-bubble-group relative overflow-x-hidden"
    :threshold="8"
    content-class="pxd-bubble-group--content relative w-full content-visibility-auto"
    :content-style="contentStyle"
    v-bind="$attrs"
  >
    <template v-if="listData">
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
    </template>

    <slot v-else />

    <template #action>
      <PBacktop
        class="bottom-1 shadow-sm left-1/2 z-1 w-max -translate-x-1/2 rounded-full"
        scroll-target="bottom"
        :append-to-body="false"
        scroll-behavior="instant"
      />
    </template>
  </PStickToBottom>
</template>
