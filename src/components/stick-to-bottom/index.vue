<script lang="ts" setup>
import type { StickToBottomEmits, StickToBottomProps } from './types'
import { shallowRef, watch } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useStickToBottom } from '../../composables/use-stick-to-bottom.js'

defineOptions({
  name: 'PStickToBottom',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StickToBottomProps>(), {
  enabled: true,
  threshold: 16,
})

const emits = defineEmits<StickToBottomEmits>()

const containerRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()
const actionRef = shallowRef<HTMLElement>()

const { classes, attrs } = useTailwindVariant({
  base: 'pxd-stick-to-bottom min-h-0 w-full max-w-full overflow-y-auto [overflow-anchor:none]',
})

const { isAtBottom, scrollToBottom, forceStickToBottom, stickIfNeeded, update } = useStickToBottom(
  containerRef,
  contentRef,
  {
    threshold: () => props.threshold,
    enabled: () => props.enabled,
    action: actionRef,
  },
)

watch(
  () => isAtBottom.value,
  (value) => {
    emits('change', value)
  },
)

defineExpose({
  containerRef,
  contentRef,
  isAtBottom,
  scrollToBottom,
  forceStickToBottom,
  stickIfNeeded,
  update,
})
</script>

<template>
  <div data-stick-to-bottom ref="containerRef" :class="classes" v-bind="attrs">
    <div ref="contentRef" class="pxd-stick-to-bottom--content" :class="contentClass">
      <slot />
    </div>

    <div
      v-if="$slots.action"
      ref="actionRef"
      class="pxd-stick-to-bottom--action bottom-0 sticky w-full"
    >
      <slot
        name="action"
        :is-at-bottom="isAtBottom"
        :scroll-to-bottom="scrollToBottom"
        :force-stick-to-bottom="forceStickToBottom"
      />
    </div>
  </div>
</template>
