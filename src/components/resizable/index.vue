<script lang="ts" setup>
import type { ResizableProps, PanelConfig, HandleConfig } from './types'
import { nextTick, onMounted, ref, shallowRef } from 'vue'
import { provideResizableContext } from '../../contexts/resizable'

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
})

const panelSizes = ref<Record<string, number>>({})
const panelConfigs = ref<PanelConfig[]>([])
const handleConfigs = ref<HandleConfig[]>([])

const orderCounter = ref(0)
const containerRef = shallowRef<HTMLElement>()

// 提供给子组件注册使用的方法
function registerPanel(config: Omit<PanelConfig, 'order'>) {
  const existingIndex = panelConfigs.value.findIndex((p) => p.id === config.id)
  if (existingIndex === -1) {
    panelConfigs.value.push({ ...config, order: orderCounter.value++ })
  } else {
    panelConfigs.value[existingIndex] = {
      ...config,
      order: panelConfigs.value[existingIndex]!.order,
    }
  }
  // 重新排序并初始化面板大小
  panelConfigs.value.sort((a, b) => a.order - b.order)
  nextTick(() => {
    initPanelSizes()
  })
}

function unregisterPanel(id: string) {
  const index = panelConfigs.value.findIndex((p) => p.id === id)
  if (index !== -1) {
    panelConfigs.value.splice(index, 1)
    const { [id]: _, ...rest } = panelSizes.value
    panelSizes.value = rest
  }
}

function registerHandle(config: Omit<HandleConfig, 'order'>) {
  const existingIndex = handleConfigs.value.findIndex((h) => h.id === config.id)
  if (existingIndex === -1) {
    handleConfigs.value.push({ ...config, order: orderCounter.value++ })
  } else {
    handleConfigs.value[existingIndex] = {
      ...config,
      order: handleConfigs.value[existingIndex]!.order,
    }
  }
  // 重新排序 handles
  handleConfigs.value.sort((a, b) => a.order - b.order)
}

function unregisterHandle(id: string) {
  const index = handleConfigs.value.findIndex((h) => h.id === id)
  if (index !== -1) {
    handleConfigs.value.splice(index, 1)
  }
}

function getPanelSize(id: string): number {
  return panelSizes.value[id] || 0
}

function onHandleDrag(handleId: string, delta: { deltaX: number; deltaY: number }) {
  // 根据 handle 在 DOM 中的位置找到对应的面板索引
  // 每个 handle 控制其前后两个面板的大小调整
  const handleOrder = handleConfigs.value.find((h) => h.id === handleId)?.order
  if (handleOrder === undefined) {
    return
  }

  // 找到这个 handle 前面有多少个面板
  const panelsBeforeThisHandle = panelConfigs.value.filter((p) => p.order < handleOrder).length

  // 这个 handle 控制的是第 panelsBeforeThisHandle 和 panelsBeforeThisHandle + 1 个面板
  const panelIndex = panelsBeforeThisHandle - 1

  if (panelIndex >= 0 && panelIndex + 1 < panelConfigs.value.length) {
    onDrag(panelIndex, delta)
  }
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
function calculateInitialPanelSizes(): {
  sizes: Record<string, number>
  remainingSize: number
  autoSizedPanelIds: string[]
} {
  const sizes: Record<string, number> = {}
  let remainingSize = 100
  const autoSizedPanelIds: string[] = []

  const sortedConfigs = [...panelConfigs.value].sort((a, b) => a.order - b.order)

  sortedConfigs.forEach((config) => {
    const minSize = config.minSize || 0
    const initialSizeNum = config.size

    if (initialSizeNum !== null && initialSizeNum !== undefined) {
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
  if (panelConfigs.value.length === 0) {
    return
  }

  await nextTick()

  const { sizes, remainingSize, autoSizedPanelIds } = calculateInitialPanelSizes()
  panelSizes.value = distributeRemainingSpace(sizes, remainingSize, autoSizedPanelIds)
}

function onDrag(index: number, { deltaX, deltaY }: { deltaX: number; deltaY: number }) {
  if (index < 0 || index + 1 >= panelConfigs.value.length) {
    return
  }

  const containerSize = calculateContainerSize()
  if (containerSize <= 0) {
    return
  }

  const prevId = panelConfigs.value[index]!.id
  const nextId = panelConfigs.value[index + 1]!.id

  const delta = props.direction === 'horizontal' ? deltaX : deltaY
  const deltaPercent = (delta / containerSize) * 100

  const prevSize = panelSizes.value[prevId] || 0
  const nextSize = panelSizes.value[nextId] || 0

  const prevMinSize = panelConfigs.value[index]?.minSize || 0
  const nextMinSize = panelConfigs.value[index + 1]?.minSize || 0

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
    :data-direction="direction"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[direction=vertical]:flex-col"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
