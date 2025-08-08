<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentClass, ComponentPosition, ComponentVariant } from '../../types/shared'
import { computed } from 'vue'
import { isTouchDevice } from '../../utils/is'
import { getFallbackValue } from '../../utils/value'
import PPopover from '../popover/index.vue'

interface Props {
  offset?: number
  content?: string
  variant?: ComponentVariant
  position?: ComponentPosition
  disabled?: boolean
  showArrow?: boolean
  desktopOnly?: boolean
  triggerClass?: ComponentClass
  popoverClass?: ComponentClass
  triggerStyle?: CSSProperties | string
  popoverStyle?: CSSProperties | string
}

defineOptions({
  name: 'PTooltip',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    variant: 'primary',
    position: 'top',
    showArrow: true,
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

const computedVariant = computed(() => getFallbackValue(props.variant, VARIANTS, 'primary'))

const computedDisabled = computed(() => {
  return props.disabled || (props.desktopOnly && isTouchDevice())
})

const computedPopoverClass = computed(() => {
  return ['px-3 py-2 text-gray-100 rounded-md text-[13px] break-words whitespace-pre-line shadow-border-tooltip bg-(--color)', props.popoverClass].join(' ')
})
</script>

<template>
  <PPopover
    class="pxd-tooltip"
    show-arrow
    :position="position"
    :disabled="computedDisabled"
    :arrow-color="computedVariant"
    :trigger-class="triggerClass"
    :trigger-style="triggerStyle"
    :popover-class="computedPopoverClass"
    :popover-style="popoverStyle"
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
