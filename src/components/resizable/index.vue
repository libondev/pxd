<script lang="ts" setup>
import type { ResizableProps, PanelConfig, HandleConfig } from './types'
import { nextTick, onMounted, ref, shallowRef } from 'vue'
import { useOrderedChildren } from '../../composables/_internal/use-ordered-children.js'
import { provideResizableContext } from '../../contexts/resizable.js'
import { isNil } from '../../utils/is.js'

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
})

const panelSizes = ref<Record<string, number>>({})
const containerRef = shallowRef<HTMLElement>()

const panelRegistry = useOrderedChildren<PanelConfig>()
const handleRegistry = useOrderedChildren<HandleConfig>()

function registerPanel(key: string, config: Omit<PanelConfig, 'id'>, el?: HTMLElement | null) {
  panelRegistry.register(key, { ...config, id: key }, el)
  void nextTick(initPanelSizes)
}

function unregisterPanel(key: string) {
  const payload = panelRegistry.unregister(key)

  if (payload) {
    const { [payload.id]: _, ...rest } = panelSizes.value
    panelSizes.value = rest
  }

  void nextTick(initPanelSizes)
}

function registerHandle(key: string, config: HandleConfig, el?: HTMLElement | null) {
  handleRegistry.register(key, config, el)
}

function unregisterHandle(key: string) {
  handleRegistry.unregister(key)
}

function getPanelSize(id: string): number {
  return panelSizes.value[id] || 0
}

function onHandleDrag(key: string, delta: { deltaX: number; deltaY: number }) {
  // panels and handles are interleaved in the DOM (panel, handle, panel, ...),
  // so the i-th handle controls the i-th and (i+1)-th panels.
  const handleIndex = handleRegistry.items.value.findIndex((item) => item.key === key)

  if (handleIndex === -1) {
    return
  }

  onDrag(handleIndex, delta)
}

/**
 * 计算容器的总尺寸（宽度或高度，取决于方向）
 */
function calculateContainerSize(): number {
  if (!containerRef.value) {
    return 0
  }

  return props.direction === 'horizontal'
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight
}

/**
 * 计算每个面板的初始百分比大小（总计 100），以面板 ID 为键返回
 */
function calculateInitialPanelSizes(configs: PanelConfig[]): {
  sizes: Record<string, number>
  remainingSize: number
  autoSizedPanelIds: string[]
} {
  const sizes: Record<string, number> = {}
  let remainingSize = 100
  const autoSizedPanelIds: string[] = []

  configs.forEach((config) => {
    const minSize = config.minSize || 0
    const initialSizeNum = config.size

    if (!isNil(initialSizeNum)) {
      sizes[config.id] = Math.max(initialSizeNum, minSize)
      remainingSize -= sizes[config.id]!
    } else {
      sizes[config.id] = minSize
      remainingSize -= minSize
      autoSizedPanelIds.push(config.id)
    }
  })

  return { sizes, remainingSize, autoSizedPanelIds }
}

/**
 * 在自动调整大小的面板之间均等分配剩余百分比空间
 */
function distributeRemainingSpace(
  sizes: Record<string, number>,
  remainingSize: number,
  autoSizedPanelIds: string[],
): Record<string, number> {
  if (autoSizedPanelIds.length === 0 || remainingSize <= 0) {
    return sizes
  }

  const updatedSizes = { ...sizes }
  const avgSize = remainingSize / autoSizedPanelIds.length

  autoSizedPanelIds.forEach((id) => {
    updatedSizes[id]! += avgSize
  })

  return updatedSizes
}

async function initPanelSizes() {
  const configs = panelRegistry.items.value.map((item) => item.payload)

  if (configs.length === 0) {
    return
  }

  await nextTick()

  const { sizes, remainingSize, autoSizedPanelIds } = calculateInitialPanelSizes(configs)
  panelSizes.value = distributeRemainingSpace(sizes, remainingSize, autoSizedPanelIds)
}

function onDrag(index: number, { deltaX, deltaY }: { deltaX: number; deltaY: number }) {
  const panels = panelRegistry.items.value

  if (index < 0 || index + 1 >= panels.length) {
    return
  }

  const containerSize = calculateContainerSize()
  if (containerSize <= 0) {
    return
  }

  const prevId = panels[index]!.payload.id
  const nextId = panels[index + 1]!.payload.id

  const delta = props.direction === 'horizontal' ? deltaX : deltaY
  const deltaPercent = (delta / containerSize) * 100

  const prevSize = panelSizes.value[prevId] || 0
  const nextSize = panelSizes.value[nextId] || 0

  const prevMinSize = panels[index]!.payload.minSize || 0
  const nextMinSize = panels[index + 1]!.payload.minSize || 0

  let newPrevSize = prevSize + deltaPercent
  let newNextSize = nextSize - deltaPercent

  if (newPrevSize < prevMinSize) {
    const diff = prevMinSize - newPrevSize
    newPrevSize = prevMinSize
    newNextSize -= diff
  } else if (newNextSize < nextMinSize) {
    const diff = nextMinSize - newNextSize
    newNextSize = nextMinSize
    newPrevSize -= diff
  }

  if (newPrevSize < prevMinSize) {
    newPrevSize = prevMinSize
  }
  if (newNextSize < nextMinSize) {
    newNextSize = nextMinSize
  }

  panelSizes.value[prevId] = newPrevSize
  panelSizes.value[nextId] = newNextSize
}

provideResizableContext({
  props,
  panelSizes,
  registerPanel,
  unregisterPanel,
  registerHandle,
  unregisterHandle,
  getPanelSize,
  onHandleDrag,
  resetPanels: initPanelSizes,
})

onMounted(async () => {
  await nextTick()
  initPanelSizes()
})
</script>

<template>
  <div
    ref="containerRef"
    :data-orientation="direction"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[orientation=vertical]:flex-col"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
