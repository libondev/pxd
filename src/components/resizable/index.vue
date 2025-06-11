<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue'
import { nextTick, onMounted, provide, ref } from 'vue'

interface Props {
  direction?: 'row' | 'col'
}

defineOptions({
  name: 'PResizable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    direction: 'row',
  },
)

// 提供方向给子组件
provide('resizable-direction', props.direction)

const container = ref<HTMLElement | null>(null)
const panels = ref<any[]>([])

// 初始化面板大小
async function initPanelSizes() {
  if (panels.value.length === 0) {
    return
  }

  // 等待DOM更新完成
  await nextTick()

  const totalSize = container.value
    ? (props.direction === 'row' ? container.value.offsetWidth : container.value.offsetHeight)
    : 0

  if (totalSize <= 0) {
    return
  }

  // 计算每个面板的平均大小
  const panelCount = panels.value.length
  const avgSize = Math.floor(totalSize / panelCount)

  // 设置每个面板的初始大小
  panels.value.forEach((panel) => {
    panel.setSize(`${avgSize}px`)
  })
}

// 处理拖拽调整大小的直接方法
function handleResizeMove(data: { delta: number, direction: string, index: number }) {
  const { delta, index } = data

  if (index <= 0 || index >= panels.value.length) {
    return
  }

  const prevPanel = panels.value[index - 1]
  const nextPanel = panels.value[index]

  if (!prevPanel || !nextPanel) {
    return
  }

  const prevElement = prevPanel.getElement()
  const nextElement = nextPanel.getElement()

  if (!prevElement || !nextElement) {
    return
  }

  const dimensionProp = props.direction === 'row' ? 'offsetWidth' : 'offsetHeight'
  const prevSize = prevElement[dimensionProp]
  const nextSize = nextElement[dimensionProp]

  // 计算新尺寸
  const newPrevSize = prevSize + delta
  const newNextSize = nextSize - delta

  // 设置最小尺寸限制
  const minSize = 50
  if (newPrevSize < minSize || newNextSize < minSize) {
    return
  }

  // 更新面板尺寸
  prevPanel.setSize(`${newPrevSize}px`)
  nextPanel.setSize(`${newNextSize}px`)
}

// 将调整大小方法提供给子组件
provide('resize-move', handleResizeMove)

// 注册面板的方法
function registerPanel(panel: ComponentPublicInstance) {
  panels.value.push(panel)
  return panels.value.length - 1
}

// 提供注册方法给子组件
provide('register-panel', registerPanel)

onMounted(async () => {
  // 等待所有面板注册完成
  await nextTick()
  initPanelSizes()
  // 现在为每个句柄元素设置索引
  if (container.value) {
    const handles = Array.from(container.value.querySelectorAll('.pxd-resizable-handle'))
    handles.forEach((handle, index) => {
      handle.setAttribute('data-index', String(index + 1))
    })
  }
})
</script>

<template>
  <div
    ref="container"
    :data-orientation="direction"
    class="pxd-resizable flex w-full h-full"
  >
    <slot />
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
