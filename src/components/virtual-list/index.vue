<script setup lang="ts">
import { useVirtualList } from '../../composables/use-virtual-list'
import type { VirtualListProps } from './types'
import { shallowRef } from 'vue'

const props = withDefaults(defineProps<VirtualListProps>(), {
  dataKey: 'id',
  itemSize: 50,
  overScan: 2,
  listData: () => [],
})

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
  </div>
</template>
