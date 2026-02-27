<script setup lang="ts">
import { useVirtualList } from '../../composables/use-virtual-list'
import type { VirtualListProps, VirtualListEmits } from './types'
import { shallowRef } from 'vue'

const props = withDefaults(defineProps<VirtualListProps>(), {
  dataKey: 'id',
  itemSize: 50,
  overScan: 2,
  listData: () => [],
  reachBottomThreshold: 50,
  errorMessage: 'Request failed, click to try again',
  loadingMessage: 'Data is loading, please wait...',
  finishedMessage: 'No more data',
})

const emits = defineEmits<VirtualListEmits>()

const containerRef = shallowRef<HTMLElement>()

console.log(props.status)

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
  <div ref="containerRef" class="pxd-virtual-list relative overflow-auto">
    <div class="pxd-virtual-list--content relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="virtualItem in virtualItems"
        :key="virtualItem.key as string"
        :ref="(el) => measureElement(el)"
        :data-index="virtualItem.index"
        class="pxd-virtual-list--item left-0 top-0 absolute w-full"
        :style="{ transform: `translateY(${virtualItem.start}px)` }"
      >
        <slot :item="listData[virtualItem.index]" :virtual-item="virtualItem" />
      </div>
    </div>

    <div
      v-if="status"
      class="group pxd-virtual-list--message py-4 text-sm left-0 right-0 text-center text-gray-600 empty:hidden"
      :class="{ 'cursor-pointer': status === 'error' }"
      @click="onRetryClick"
    >
      <slot name="message">
        <span
          v-if="status === 'error'"
          class="group-hover:text-gray-800 motion-safe:transition-colors"
        >
          {{ errorMessage }}
        </span>
        <span v-else-if="status === 'loading'">{{ loadingMessage }}</span>
        <span v-else-if="status === 'finished'">{{ finishedMessage }}</span>
      </slot>
    </div>
  </div>
</template>
