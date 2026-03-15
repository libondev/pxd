<script setup lang="ts">
import type { VirtualListProps, VirtualListEmits } from './types'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { shallowRef } from 'vue'
import { useVirtualList } from '../../composables/use-virtual-list'

defineOptions({
  name: 'PVirtualList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<VirtualListProps>(), {
  dataKey: 'id',
  itemSize: 50,
  overScan: 2,
  listData: () => [],
  errorText: 'Request failed. Click to reload',
  loadingText: 'Loading...',
  finishedText: 'Finished',
  bottomThreshold: 50,
})

const emits = defineEmits<VirtualListEmits>()

const containerRef = shallowRef<HTMLElement>()

const {
  totalSize,
  virtualItems,
  measureElement,
  getVirtualizer,
  scrollToIndex,
  scrollToOffset,
  scrollBy,
} = useVirtualList(containerRef, props)

function onRetryClick() {
  if (props.status !== 'error') {
    return
  }

  emits('retry')
}

defineExpose({
  totalSize,
  virtualItems,
  getVirtualizer,
  scrollToIndex,
  scrollToOffset,
  scrollBy,
})
</script>

<template>
  <div ref="containerRef" class="pxd-virtual-list relative overflow-auto" v-bind="$attrs">
    <div
      class="pxd-virtual-list--content relative w-full content-visibility-auto"
      :style="{ height: `${totalSize}px`, containIntrinsicSize: `auto ${totalSize}px` }"
    >
      <div
        v-for="virtualItem in virtualItems"
        :key="virtualItem.key"
        :ref="(el) => measureElement(el)"
        :data-index="virtualItem.index"
        class="pxd-virtual-list--item left-0 top-0 absolute w-full"
        :style="{ transform: `translateY(${virtualItem.start}px)` }"
      >
        <slot name="item" :item="listData[virtualItem.index]" :virtual-item="virtualItem" />
      </div>
    </div>

    <div
      v-if="status"
      class="pxd-virtual-list--message py-4 text-sm left-0 right-0 flex items-center justify-center text-gray-600 empty:hidden motion-safe:transition-colors"
      :class="{ 'cursor-pointer hover:text-gray-900': status === 'error' }"
      @click="onRetryClick"
    >
      <slot name="message">
        <span v-if="status === 'error'">{{ errorText }}</span>
        <span v-else-if="status === 'finished'">{{ finishedText }}</span>
        <template v-else-if="status === 'loading'">
          <LoaderCircleIcon class="mr-1.5 motion-safe:animate-spin" />
          <span>{{ loadingText }}</span>
        </template>
      </slot>
    </div>
  </div>
</template>
