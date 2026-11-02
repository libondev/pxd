<script lang="ts" setup>
import type { VirtualListScrollSource } from '../../composables/use-virtual-list.js'
import type { BubbleGroupProps } from './types'
import type { CSSProperties } from 'vue'
import { computed, onMounted, onScopeDispose, shallowRef } from 'vue'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import { cachedOn, throttleByRaf } from '../../utils/event.js'
import PBacktop from '../backtop/index.vue'
import PStickToBottom from '../stick-to-bottom/index.vue'

defineOptions({
  name: 'PBubbleGroup',
  inheritAttrs: false,
})

const props = defineProps<BubbleGroupProps>()

const ITEM_STYLE_CACHE_LIMIT = 512
const itemStyles = new Map<number, CSSProperties>()

const stickRef = shallowRef<InstanceType<typeof PStickToBottom>>()
const scrollVersion = shallowRef(0)

const isVirtual = computed(() => props.virtual === true && !!props.data)

const {
  totalSize,
  virtualItems,
  measureElement,
  scrollSource: virtualScrollSource,
} = useVirtualList(() => stickRef.value?.containerRef ?? null, {
  enabled: () => isVirtual.value,
  get dataKey() {
    return props.dataKey
  },
  get items() {
    return props.data
  },
  get itemSize() {
    return props.itemSize
  },
  get overScan() {
    return props.overScan
  },
  // The content's height comes from the measured total, so the grow is not a node the stick can
  // see: its size is only final once the render that applies it has landed.
  onGeometryChange: () => stickRef.value?.stickIfNeeded(),
})

const contentStyle = computed(() => {
  if (!isVirtual.value) {
    return undefined
  }

  return {
    '--bubble-group-height': `${totalSize.value}px`,
  }
})

function getItemStyle(start: number): CSSProperties {
  let style = itemStyles.get(start)

  if (!style) {
    if (itemStyles.size >= ITEM_STYLE_CACHE_LIMIT) {
      itemStyles.clear()
    }

    style = { transform: `translateY(${start}px)`, contain: 'layout' }
    itemStyles.set(start, style)
  }

  return style
}

function getDataItemKey(item: any, index: number) {
  return (props.dataKey ? item[props.dataKey] : index) ?? index
}

function getContainer(): HTMLElement | null {
  return stickRef.value?.containerRef ?? null
}

function getItemElement(index: number): HTMLElement | null {
  const content = stickRef.value?.contentRef

  return (content?.children[index] as HTMLElement | undefined) ?? null
}

function getDomOffset(index: number): number | undefined {
  void scrollVersion.value

  const container = getContainer()
  const row = getItemElement(index)

  if (!container || !row) {
    return undefined
  }

  return (
    row.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  )
}

const bumpScroll = throttleByRaf(() => {
  if (isVirtual.value) {
    return
  }

  scrollVersion.value++
})

const scrollSource: VirtualListScrollSource = {
  getOffsetForIndex(index) {
    return isVirtual.value ? virtualScrollSource.getOffsetForIndex(index) : getDomOffset(index)
  },
  getScrollOffset() {
    if (isVirtual.value) {
      return virtualScrollSource.getScrollOffset()
    }

    void scrollVersion.value

    return getContainer()?.scrollTop ?? null
  },
  getMaxScrollOffset() {
    if (isVirtual.value) {
      return virtualScrollSource.getMaxScrollOffset()
    }

    void scrollVersion.value

    const container = getContainer()

    return container ? Math.max(0, container.scrollHeight - container.clientHeight) : 0
  },
  scrollToIndex(index, options) {
    if (isVirtual.value) {
      virtualScrollSource.scrollToIndex(index, options)

      return
    }

    const offset = getDomOffset(index)
    const container = getContainer()

    if (offset == null || !container) {
      return
    }

    container.scrollTo({ top: Math.max(0, offset), behavior: options?.behavior ?? 'auto' })
  },
}

let stopScroll: (() => void) | null = null

onMounted(() => {
  const container = getContainer()

  if (container) {
    stopScroll = cachedOn(container, 'scroll', bumpScroll, { passive: true })
  }

  stickRef.value?.forceStickToBottom()
})

onScopeDispose(() => {
  stopScroll?.()
  stopScroll = null
  bumpScroll.cancel()
})

defineExpose({
  scrollSource,
  forceStickToBottom: () => stickRef.value?.forceStickToBottom(),
})
</script>

<template>
  <PStickToBottom
    ref="stickRef"
    data-bubble-group
    class="pxd-bubble-group relative overflow-x-hidden"
    :threshold="8"
    content-class="pxd-bubble-group--content relative w-full h-(--bubble-group-height)"
    :style="contentStyle"
    v-bind="$attrs"
  >
    <template v-if="data && virtual">
      <div
        v-for="virtualItem in virtualItems"
        :key="virtualItem.key"
        :ref="measureElement"
        :data-index="virtualItem.index"
        class="pxd-bubble-group--item sibling:pbs-3 left-0 top-0 absolute w-full"
        :style="getItemStyle(virtualItem.start)"
      >
        <slot name="item" :item="data[virtualItem.index]" :index="virtualItem.index" />
      </div>
    </template>

    <template v-else-if="data">
      <div
        v-for="(item, index) in data"
        :key="getDataItemKey(item, index)"
        :data-index="index"
        class="pxd-bubble-group--item sibling:pbs-3 w-full"
      >
        <slot name="item" :item="item" :index="index" />
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
