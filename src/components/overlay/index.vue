<script lang="ts" setup>
import type { OverlayEmits, OverlayProps } from './types'
import { computed } from 'vue'
import { useOverlayManager } from '../../composables/_internal/use-overlay-manager.js'
import { getNestedLevel } from '../../composables/_internal/use-top-layer.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { NOOP } from '../../utils/event.js'

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<OverlayProps>(), {
  to: 'body',
  modelValue: false,
  closeOnPressEscape: true,
  lockScrollOnVisible: true,
  closeOnClickOverlay: false,
})

const emits = defineEmits<OverlayEmits>()

const computedStyle = computed(() => ({
  '--overlay-index': props.zIndex,
}))

const configProvider = useConfigProvider()

useOverlayManager({
  visible: () => props.modelValue,
  level: () => getNestedLevel(props.to),
  zIndex: () => props.zIndex,
  lockScrollOnVisible: () => props.lockScrollOnVisible,
  onPressEscape: (ev: KeyboardEvent) => {
    if (!props.closeOnPressEscape) {
      return false
    }

    emits('escape', ev)

    if (!ev.defaultPrevented) {
      emits('update:model-value', false)
    }

    return true
  },
})

function onOverlayClick(ev: PointerEvent) {
  emits('click', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  emits('update:model-value', false)
}
</script>

<template>
  <Teleport :to="to">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        data-overlay
        v-if="variant !== 'none' && modelValue"
        role="presentation"
        aria-hidden="true"
        :data-variant="variant"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        class="pxd-overlay inset-0 data-[variant='blurred']:backdrop-blur-sm pointer-events-auto fixed z-(--overlay-index) bg-background-100/80 select-none motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @click="onOverlayClick"
        @touchmove.prevent.stop="NOOP"
      />
    </Transition>

    <slot />
  </Teleport>
</template>
