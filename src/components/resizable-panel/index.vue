<script lang="ts" setup>
import type { ResizableContext } from '../../types/components/resizable'
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import { getUniqueId } from '../../utils/uid'

interface Props {
  initialSize?: number | null
  minSize?: number
}

defineOptions({
  name: 'PResizablePanel',
})

const props = withDefaults(defineProps<Props>(), {
  initialSize: null,
  minSize: 0,
})

const context = inject<ResizableContext>('pxdResizable')

if (!context) {
  throw new Error('PResizablePanel must be used within PResizable')
}

const uniqueId = getUniqueId()

// 注册面板
onMounted(() => {
  context?.registerPanel({
    id: uniqueId,
    initialSize: props.initialSize,
    minSize: props.minSize,
  })
})

// 注销面板
onBeforeUnmount(() => {
  context?.unregisterPanel(uniqueId)
})

// 监听 props 变化并更新注册信息
watch(() => [props.initialSize, props.minSize], () => {
  context?.registerPanel({
    id: uniqueId,
    initialSize: props.initialSize,
    minSize: props.minSize,
  })
}, { deep: true })

const computedStyle = computed(() => {
  if (!context) {
    return {}
  }

  // 直接通过索引获取尺寸，确保响应式更新
  const panelIndex = context.panelConfigs.value.findIndex(p => p.id === uniqueId)
  const size = panelIndex >= 0 ? context.panelSizes.value[panelIndex] || 0 : 0

  return {
    flexBasis: size > 0 ? `${size}px` : 'auto',
    flexGrow: size > 0 ? 0 : 1,
    flexShrink: size > 0 ? 0 : 1,
    // 在 Vue 2.7 中添加显式的 width/height 以确保更新生效
    ...(size > 0 && context.direction.value === 'horizontal' ? { width: `${size}px` } : {}),
    ...(size > 0 && context.direction.value === 'vertical' ? { height: `${size}px` } : {}),
  }
})
</script>

<template>
  <div
    class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
    :style="computedStyle"
  >
    <slot />
  </div>
</template>
