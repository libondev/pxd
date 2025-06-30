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
  <div ref="containerRef" class="pxd-virtual-list overflow-auto relative">
    <div class="pxd-virtual-list--content w-full absolute top-0 z-0" :style="listStyle">
      <div
        v-for="item in renderList"
        :key="item[dataKey]"
        :ref="(el) => setItemRef(el as HTMLElement, item[dataKey])"
        class="pxd-virtual-list--item w-full"
      >
        <slot :data="item" />
      </div>
    </div>

    <div class="pxd-virtual-list--placeholder" :style="`height:${listHeight}px`" />
  </div>
</template>
