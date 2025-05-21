<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentVariant } from '../../types/components'
import { computed } from 'vue'
import { isTouchDevice } from '../../utils/device'
import PPopover from '../popover/index.vue'

interface Props {
  content?: string
  disabled?: boolean
  desktopOnly?: boolean
  popoverClass?: string
  popoverStyle?: CSSProperties | string
  variant?: ComponentVariant
}

defineOptions({
  name: 'PTooltip',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    variant: 'primary',
    popoverClass: '',
    popoverStyle: '',
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
  if (typeof props.popoverStyle === 'string') {
    return `${props.popoverStyle};--arrow-color: ${VARIANTS[props.variant] || VARIANTS.primary}`
  } else {
    return {
      ...(props.popoverStyle ?? {}),
      '--arrow-color': VARIANTS[props.variant] || VARIANTS.primary,
    }
  }
})
</script>

<template>
  <PPopover
    class="pxd-tooltip"
    :disabled="computedDisabled"
    :popover-class="computedPopoverClass"
    :popover-style="computedPopoverStyle"
  >
    <slot />

    <template #content>
      <slot name="content">
        {{ content }}
      </slot>
    </template>
  </PPopover>
</template>
