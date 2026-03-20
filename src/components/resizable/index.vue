<script lang="ts" setup>
import type { ResizableProps, PanelConfig, HandleConfig } from './types'
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue'
import { provideResizableContext } from '../../contexts/resizable'

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
})

const panelSizes = ref<number[]>([])
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
    panelSizes.value.splice(index, 1)
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
  const index = panelConfigs.value.findIndex((p) => p.id === id)
  return index !== -1 ? panelSizes.value[index] || 0 : 0
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
 * Calculate the initial percentage size of each panel (total 100),
 * and collect the indices of panels that need to be automatically distributed
 */
function calculateInitialPanelSizes(): {
  sizes: number[]
  remainingSize: number
  autoSizedPanelIndices: number[]
} {
  const sizes = Array.from({ length: panelConfigs.value.length }, () => 0)
  let remainingSize = 100
  const autoSizedPanelIndices: number[] = []

  const sortedConfigs = [...panelConfigs.value].sort((a, b) => a.order - b.order)

  sortedConfigs.forEach((config, index) => {
    const minSize = config.minSize || 0
    const initialSizeNum = config.size

    if (initialSizeNum !== null && initialSizeNum !== undefined) {
      const size = Math.max(initialSizeNum, minSize)
      sizes[index] = size
      remainingSize -= size
    } else {
      sizes[index] = minSize
      remainingSize -= minSize
      autoSizedPanelIndices.push(index)
    }
  })

  return { sizes, remainingSize, autoSizedPanelIndices }
}

/**
 * Distribute the remaining percentage space evenly between the automatically sized panels
 */
function distributeRemainingSpace(
  sizes: number[],
  remainingSize: number,
  autoSizedPanelIndices: number[],
): number[] {
  if (autoSizedPanelIndices.length === 0 || remainingSize <= 0) {
    return sizes
  }

  const updatedSizes = [...sizes]
  const avgSize = remainingSize / autoSizedPanelIndices.length

  autoSizedPanelIndices.forEach((index) => {
    updatedSizes[index]! += avgSize
  })

  return updatedSizes
}

async function initPanelSizes() {
  if (panelConfigs.value.length === 0) {
    return
  }

  await nextTick()

  const { sizes, remainingSize, autoSizedPanelIndices } = calculateInitialPanelSizes()
  const finalSizes = distributeRemainingSpace(sizes, remainingSize, autoSizedPanelIndices)

  panelSizes.value = finalSizes
}

function onDrag(index: number, { deltaX, deltaY }: { deltaX: number; deltaY: number }) {
  if (index < 0 || index + 1 >= panelSizes.value.length) {
    return
  }

  const containerSize = calculateContainerSize()
  if (containerSize <= 0) {
    return
  }

  // Convert pixel increment to percentage increment
  const delta = props.direction === 'horizontal' ? deltaX : deltaY
  const deltaPercent = (delta / containerSize) * 100

  const prevSize = panelSizes.value[index]!
  const nextSize = panelSizes.value[index + 1]!

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

  // hack for vue2
  // const newSizes = [...panelSizes.value]
  panelSizes.value[index] = newPrevSize
  panelSizes.value[index + 1] = newNextSize
  // panelSizes.value = newSizes
}

provideResizableContext({
  registerPanel,
  unregisterPanel,
  registerHandle,
  unregisterHandle,
  getPanelSize,
  onHandleDrag,
  resetPanels: initPanelSizes,
  direction: computed(() => props.direction),
  panelSizes,
  panelConfigs,
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
