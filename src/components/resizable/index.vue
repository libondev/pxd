<script lang="ts" setup>
import type { VNode } from 'vue'
import { cloneVNode, computed, nextTick, onMounted, ref, shallowRef, useSlots } from 'vue'
import PResizableHandle from '../resizable-handle/index.vue'

interface Props {
  direction?: 'row' | 'col'
}

defineOptions({
  name: 'PResizable',
})

const props = withDefaults(defineProps<Props>(), {
  direction: 'row',
})

const slots = useSlots()
const panelSizes = ref<number[]>([])
const containerRef = shallowRef<HTMLElement | null>(null)

function getVNodeName(vnode: VNode): string | undefined {
  if (!vnode) {
    return undefined
  }
  // @ts-expect-error vue 2 compat
  if (vnode.type?.name) {
    // vue 3
    // @ts-expect-error vue 2 compat
    return vnode.type.name
  }
  // @ts-expect-error vue 2 compat
  if (vnode.componentOptions?.Ctor?.options?.name) {
    // vue 2
    // @ts-expect-error vue 2 compat
    return vnode.componentOptions.Ctor.options.name
  }
  return undefined
}

const panelVNodes = computed(() => {
  if (!slots.default) {
    return []
  }
  return slots.default().filter(vnode => getVNodeName(vnode) === 'PResizablePanel')
})

// 从 VNode 中安全地获取属性值
function getVNodeProp(vnode: VNode, propName: string, defaultValue: any = undefined): any {
  if (!vnode) {
    return defaultValue
  }

  // Vue 3 方式
  if (vnode.props && propName in vnode.props) {
    return vnode.props[propName]
  }

  // 尝试 kebab-case
  const kebabCase = propName.replace(/([A-Z])/g, '-$1').toLowerCase()
  if (vnode.props && kebabCase in vnode.props) {
    return vnode.props[kebabCase]
  }

  // Vue 2 方式
  // @ts-expect-error vue 2 compat
  if (vnode.componentOptions?.propsData && propName in vnode.componentOptions.propsData) {
    // @ts-expect-error vue 2 compat
    return vnode.componentOptions.propsData[propName]
  }

  // @ts-expect-error vue 2 compat
  if (vnode.componentOptions?.propsData && kebabCase in vnode.componentOptions.propsData) {
    // @ts-expect-error vue 2 compat
    return vnode.componentOptions.propsData[kebabCase]
  }

  return defaultValue
}

/**
 * 计算容器的总尺寸（宽度或高度，取决于方向）
 */
function calculateContainerSize(): number {
  if (!containerRef.value) {
    return 0
  }

  return props.direction === 'row'
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight
}

/**
 * 计算每个面板的初始大小，并收集需要自动调整大小的面板索引
 */
function calculateInitialPanelSizes(totalSize: number): {
  sizes: number[]
  remainingSize: number
  autoSizedPanelIndices: number[]
} {
  const sizes = Array.from({ length: panelVNodes.value.length }, () => 0)
  let remainingSize = totalSize
  const autoSizedPanelIndices: number[] = []

  panelVNodes.value.forEach((vnode, index) => {
    const minSize = Number(getVNodeProp(vnode, 'minSize', 0))
    const initialSize = getVNodeProp(vnode, 'initialSize', null)
    const initialSizeNum = initialSize !== null ? Number(initialSize) : null

    if (initialSizeNum !== null) {
      // 面板有指定初始大小
      const size = Math.max(initialSizeNum, minSize)
      sizes[index] = size
      remainingSize -= size
    } else {
      // 面板需要自动调整大小
      sizes[index] = minSize
      remainingSize -= minSize
      autoSizedPanelIndices.push(index)
    }
  })

  return { sizes, remainingSize, autoSizedPanelIndices }
}

/**
 * 在自动调整大小的面板之间分配剩余空间
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
  const avgSize = Math.floor(remainingSize / autoSizedPanelIndices.length)
  let remainder = remainingSize % autoSizedPanelIndices.length

  autoSizedPanelIndices.forEach((index) => {
    let sizeToAdd = avgSize
    if (remainder > 0) {
      sizeToAdd++
      remainder--
    }
    updatedSizes[index] += sizeToAdd
  })

  return updatedSizes
}

/**
 * 初始化所有面板的大小
 */
async function initPanelSizes() {
  if (panelVNodes.value.length === 0) {
    return
  }

  await nextTick()

  const totalSize = calculateContainerSize()
  if (totalSize <= 0) {
    return
  }

  const { sizes, remainingSize, autoSizedPanelIndices } = calculateInitialPanelSizes(totalSize)
  const finalSizes = distributeRemainingSpace(sizes, remainingSize, autoSizedPanelIndices)

  panelSizes.value = finalSizes
}

function onDrag(index: number, { deltaX, deltaY }: { deltaX: number, deltaY: number }) {
  const delta = props.direction === 'row' ? deltaX : deltaY
  const prevSize = panelSizes.value[index]
  const nextSize = panelSizes.value[index + 1]

  // 使用安全获取属性函数
  const prevMinSize = Number(getVNodeProp(panelVNodes.value[index], 'minSize', 0))
  const nextMinSize = Number(getVNodeProp(panelVNodes.value[index + 1], 'minSize', 0))

  let newPrevSize = prevSize + delta
  let newNextSize = nextSize - delta

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

  panelSizes.value[index] = newPrevSize
  panelSizes.value[index + 1] = newNextSize
}

/**
 * 克隆面板VNode并注入所需属性
 */
function clonePanelVNode(vnode: VNode, index: number): VNode {
  // 获取原始属性
  const originalProps = vnode.props || {}

  // 获取原始的 initialSize 和 minSize，确保使用正确的方法获取
  const originalInitialSize = getVNodeProp(vnode, 'initialSize', null)
  const originalMinSize = getVNodeProp(vnode, 'minSize', 0)

  // 创建克隆属性，确保保留所有原始属性
  const cloneProps = {
    ...originalProps,
    size: panelSizes.value[index],
    key: `panel-${index}`,
    // 显式传递这些属性，确保它们被保留
    initialSize: originalInitialSize,
    minSize: originalMinSize,
  }

  return cloneVNode(vnode, cloneProps)
}

onMounted(async () => {
  await nextTick()
  initPanelSizes()
})
</script>

<template>
  <div
    ref="containerRef"
    :data-orientation="direction"
    class="pxd-resizable flex w-full h-full"
  >
    <template v-for="(vnode, index) in panelVNodes" :key="vnode.key">
      <component :is="clonePanelVNode(vnode, index)" />
      <PResizableHandle v-if="index < panelVNodes.length - 1" @drag="onDrag(index, $event)" />
    </template>
  </div>
</template>

<style lang="postcss">
.pxd-resizable {
  flex-direction: row;

  &[data-orientation='col'] {
    flex-direction: column;
  }
}
</style>
