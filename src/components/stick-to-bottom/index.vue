<script lang="ts" setup>
import type { StickToBottomEmits, StickToBottomProps } from './types'
import { shallowRef, watch } from 'vue'
import { useStickToBottom } from '../../composables/use-stick-to-bottom.js'

defineOptions({
  name: 'PStickToBottom',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StickToBottomProps>(), {
  threshold: 8,
  enabled: true,
})

const emits = defineEmits<StickToBottomEmits>()

const containerRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const { isAtBottom, scrollToBottom, forceStickToBottom, stickIfNeeded, update } = useStickToBottom(
  containerRef,
  contentRef,
  {
    threshold: () => props.threshold,
    enabled: () => props.enabled,
  },
)

watch(isAtBottom, (value) => {
  emits('change', value)
})

defineExpose({
  isAtBottom,
  scrollToBottom,
  forceStickToBottom,
  stickIfNeeded,
  update,
})
</script>

<template>
  <div ref="containerRef" class="pxd-stick-to-bottom min-h-0 overflow-y-auto" v-bind="$attrs">
    <div ref="contentRef" class="pxd-stick-to-bottom--content">
      <slot />
    </div>
  </div>
</template>
