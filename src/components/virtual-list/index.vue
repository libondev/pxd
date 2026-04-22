<script lang="ts" setup>
import type { VirtualListProps, VirtualListEmits } from './types'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { shallowRef } from 'vue'
import { useVirtualList, type VirtualListItem } from '../../composables/use-virtual-list'

defineOptions({
  name: 'PVirtualList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<VirtualListProps>(), {
  dataKey: 'id',
  columnGap: 0,
  columnCount: 1,
  listData: () => [],
  errorText: 'Request failed. Click to reload',
  loadingText: 'Loading...',
  finishedText: 'Finished',
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

function getItemStyle(virtualItem: VirtualListItem) {
  const lanes = Math.max(1, Math.floor(props.columnCount))
  const gap = props.columnGap
  const y = `translateY(${virtualItem.start}px)`

  if (lanes <= 1) {
    return { transform: y }
  }

  const lane = virtualItem.lane
  const width = `calc((100% - ${(lanes - 1) * gap}px) / ${lanes})`
  const left = `calc(${lane} * ((100% - ${(lanes - 1) * gap}px) / ${lanes} + ${gap}px))`

  return {
    width,
    left,
    transform: y,
  }
}

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
      :class="listClass"
      :style="{ height: `${totalSize}px`, containIntrinsicSize: `auto ${totalSize}px` }"
    >
      <div
        v-for="virtualItem in virtualItems"
        :key="virtualItem.key"
        :ref="(el) => measureElement(el)"
        :data-index="virtualItem.index"
        class="pxd-virtual-list--item left-0 top-0 absolute w-full"
        :class="itemClass"
        :style="getItemStyle(virtualItem)"
      >
        <slot name="item" :item="listData[virtualItem.index]" :virtual-item="virtualItem" />
      </div>
    </div>

    <div
      v-if="status"
      class="pxd-virtual-list--message py-4 text-sm left-0 right-0 flex items-center justify-center text-gray-600 empty:hidden motion-safe:transition-colors"
      :class="{ 'cursor-pointer hover:text-gray-800': status === 'error' }"
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
