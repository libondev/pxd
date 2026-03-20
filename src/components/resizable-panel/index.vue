<script lang="ts" setup>
import type { ResizablePanelProps } from './types'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useResizableContext } from '../../contexts/resizable'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PResizablePanel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ResizablePanelProps>(), {
  size: null,
  minSize: 0,
})

const uniqueId = getUniqueId()

const resizableContext = useResizableContext()

const computedStyle = computed(() => {
  if (!resizableContext) {
    return {}
  }

  const size = resizableContext.panelSizes.value[uniqueId] || 0

  return {
    flexBasis: size > 0 ? `${size}%` : 'auto',
    flexGrow: size > 0 ? 0 : 1,
    flexShrink: size > 0 ? 0 : 1,
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
  <div
    class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
