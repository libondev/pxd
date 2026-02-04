<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useResizableContext } from '../../contexts/resizable'
import { getUniqueId } from '../../utils/uid'

interface Props {
  size?: number | null
  minSize?: number
}

defineOptions({
  name: 'PResizablePanel',
})

const props = withDefaults(defineProps<Props>(), {
  size: null,
  minSize: 0,
})

const uniqueId = getUniqueId()

const resizableContext = useResizableContext()

const computedStyle = computed(() => {
  if (!resizableContext) {
    return {}
  }

  // 直接通过索引获取尺寸，确保响应式更新
  const panelIndex = resizableContext.panelConfigs.value.findIndex((p) => p.id === uniqueId)
  const size = panelIndex >= 0 ? resizableContext.panelSizes.value[panelIndex] || 0 : 0

  return {
    flexBasis: size > 0 ? `${size}px` : 'auto',
    flexGrow: size > 0 ? 0 : 1,
    flexShrink: size > 0 ? 0 : 1,
    // 在 Vue 2.7 中添加显式的 width/height 以确保更新生效
    ...(size > 0 && resizableContext.direction.value === 'horizontal'
      ? { width: `${size}px` }
      : {}),
    ...(size > 0 && resizableContext.direction.value === 'vertical' ? { height: `${size}px` } : {}),
  }
})

onMounted(() => {
  resizableContext?.registerPanel({
    id: uniqueId,
    size: props.size,
    minSize: props.minSize,
  })
})

onBeforeUnmount(() => {
  resizableContext?.unregisterPanel(uniqueId)
})

watch(
  () => [props.size, props.minSize],
  () => {
    resizableContext?.registerPanel({
      id: uniqueId,
      size: props.size,
      minSize: props.minSize,
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden" :style="computedStyle">
    <slot />
  </div>
</template>
