<script setup lang="ts">
import { useVirtualList } from '../../composables/useVirtualList'

interface Props {
  dataKey?: string
  listData?: any[]
  itemSize?: number
}

const props = withDefaults(
  defineProps<Props>(),
  {
    dataKey: 'id',
    listData: () => [],
    itemSize: 50,
  },
)

const {
  containerRef,
  renderList,
  listHeight,
  listStyle,
  setItemRef,
} = useVirtualList(props)
</script>

<template>
  <div ref="containerRef" class="pxd-virtual-list relative overflow-auto">
    <div class="pxd-virtual-list--content top-0 absolute z-0 w-full" :style="listStyle">
      <div
        v-for="item in renderList"
        :key="item[dataKey]"
        :ref="(el) => setItemRef(el, item[dataKey])"
        class="pxd-virtual-list--item w-full"
      >
        <slot :item="item" />
      </div>
    </div>

    <div class="pxd-virtual-list--placeholder" :style="`height:${listHeight}px`" />
  </div>
</template>
