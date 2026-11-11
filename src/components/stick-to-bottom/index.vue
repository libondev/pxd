<script lang="ts" setup>
import type { StickToBottomEmits, StickToBottomProps } from './types'
import { cn } from 'cn'
import { computed, shallowRef, watch } from 'vue'
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

const wrapperClasses = computed(() =>
  cn(
    'pxd-stick-to-bottom min-h-0 size-full max-w-full overflow-y-auto [overflow-anchor:none]',
    props.wrapperClass,
  ),
)

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
  <div
    data-stick-to-bottom
    class="pxd-stick-to-bottom--root min-h-0 relative w-full max-w-full"
    v-bind="$attrs"
  >
    <div ref="containerRef" :class="wrapperClasses">
      <div ref="contentRef" class="pxd-stick-to-bottom--content" :class="contentClass">
        <slot />
      </div>
    </div>

    <div
      v-if="$slots.action"
      ref="actionRef"
      class="pxd-stick-to-bottom--action inset-x-0 bottom-1 absolute z-1"
    >
      <slot
        name="action"
        :container="containerRef"
        :is-at-bottom="isAtBottom"
        :scroll-to-bottom="scrollToBottom"
        :force-stick-to-bottom="forceStickToBottom"
      />
    </div>
  </div>
</template>
