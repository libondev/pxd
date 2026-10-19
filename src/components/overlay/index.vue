<script lang="ts" setup>
import type { OverlayEmits, OverlayProps } from './types'
import { computed, watch } from 'vue'
import { useLockScroll } from '../../composables/_internal/use-lock-scroll.js'
import { useOverlayManager } from '../../composables/_internal/use-overlay-manager.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { NOOP } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<OverlayProps>(), {
  modelValue: false,
  showOverlay: true,
  closeOnPressEscape: true,
  lockScrollOnVisible: true,
  closeOnClickOverlay: false,
})

const emits = defineEmits<OverlayEmits>()

const computedStyle = computed(() => ({
  '--overlay-index': props.zIndex,
}))

const configProvider = useConfigProvider()
const { lockScroll, unlockScroll } = useLockScroll(() => document.body, { walkAncestors: true })

const { registerOverlay, unregisterOverlay } = useOverlayManager({
  enabled: () => props.modelValue,
  lockScrollOnVisible: () => props.lockScrollOnVisible,
  lockScroll,
  unlockScroll,
  onPressEscape: (ev: KeyboardEvent) => {
    if (!props.closeOnPressEscape) {
      return
    }

    emits('escape', ev)

    if (ev.defaultPrevented) {
      return
    }

    emits('update:modelValue', false)
  },
})

function onOverlayVisibleChange(visible: boolean) {
  if (isServer()) {
    return
  }

  if (visible) {
    registerOverlay()

    return
  }

  unregisterOverlay()
}

function onOverlayClick(ev: PointerEvent) {
  emits('click', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  emits('update:modelValue', false)
}

watch(() => props.modelValue, onOverlayVisibleChange, { immediate: true })
</script>

<template>
  <PTeleport>
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        data-overlay
        v-if="showOverlay && modelValue"
        role="presentation"
        aria-hidden="true"
        :data-variant="variant"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        class="pxd-overlay inset-0 bg-black/60 sm:bg-background-100/80 data-[variant='blurred']:backdrop-blur-sm pointer-events-auto fixed z-(--overlay-index) select-none data-[variant='transparent']:opacity-0 motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @click="onOverlayClick"
        @touchmove.prevent.stop="NOOP"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>
