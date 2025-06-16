<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  size?: number
  initialSize?: number | null
  minSize?: number
}

defineOptions({
  name: 'PResizablePanel',
})

const props = withDefaults(defineProps<Props>(), {
  size: 0,
  initialSize: null,
  minSize: 0,
})

const computedStyle = computed(() => {
  const size = props.size

  return {
    flexBasis: size ? `${size}px` : '0',
    flexGrow: size ? 0 : 1,
    flexShrink: size ? 0 : 1,
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
