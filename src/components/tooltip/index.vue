<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentPosition, ComponentVariant } from '../../types/components'
import { computed } from 'vue'
import { getFallbackVariant } from '../../composables/useFallbackProps'
import { isTouchDevice } from '../../utils/is'
import PPopover from '../popover/index.vue'

interface Props {
  content?: string
  disabled?: boolean
  position?: ComponentPosition
  desktopOnly?: boolean
  popoverClass?: string
  popoverStyle?: CSSProperties | string
  variant?: ComponentVariant
}

defineOptions({
  name: 'PTooltip',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    variant: 'primary',
    popoverClass: '',
    popoverStyle: '',
    position: 'top',
  },
)

const VARIANTS = {
  primary: 'var(--color-primary)',
  error: 'var(--color-red-700)',
  warning: 'var(--color-amber-700)',
  success: 'var(--color-green-700)',
}

const computedDisabled = computed(() => {
  return props.disabled || (props.desktopOnly && isTouchDevice())
})

const computedPopoverClass = computed(() => {
  return ['px-3 py-2 text-gray-100 rounded-md text-[13px] break-words whitespace-pre-line bg-(--arrow-color)'].concat(props.popoverClass).join(' ')
})

const computedPopoverStyle = computed(() => {
  const arrowColor = getFallbackVariant(props.variant, VARIANTS, 'primary')

  if (typeof props.popoverStyle === 'string') {
    return `${props.popoverStyle};--arrow-color: ${arrowColor}`
  }

  return {
    ...(props.popoverStyle ?? {}),
    '--arrow-color': arrowColor,
  }
})
</script>

<template>
  <PPopover
    class="pxd-tooltip"
    :position="position"
    :translate-offset="3"
    :disabled="computedDisabled"
    :popover-class="computedPopoverClass"
    :popover-style="computedPopoverStyle"
    v-bind="$attrs"
  >
    <slot />

    <template #content>
      <slot name="content">
        {{ content }}
      </slot>
    </template>
  </PPopover>
</template>
