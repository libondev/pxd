<script lang="ts" setup>
import type { TooltipProps } from './types'
import { computed } from 'vue'
import { getFallbackValue } from '../../utils/get'
import { isTouchDevice } from '../../utils/is'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PTooltip',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipProps>(), {
  variant: 'primary',
  position: 'top',
  showArrow: true,
})

const VARIANTS = {
  primary: {
    bg: 'var(--color-primary)',
    text: 'text-gray-100',
  },
  error: {
    bg: 'var(--color-red-700)',
    text: 'text-gray-100 dark:text-gray-1000',
  },
  warning: {
    bg: 'var(--color-amber-700)',
    text: 'text-gray-1000 dark:text-gray-100',
  },
  success: {
    bg: 'var(--color-green-700)',
    text: 'text-gray-100 dark:text-gray-1000',
  },
}

const computedVariant = computed(() => getFallbackValue(props.variant, VARIANTS, 'primary'))

const computedDisabled = computed(() => {
  return props.disabled || (props.desktopOnly && isTouchDevice())
})

const computedClasses = computed(() => {
  return [
    'px-2 py-2 rounded-md text-sm break-words whitespace-pre-line shadow-border-tooltip bg-(--popover-arrow-bg)',
    computedVariant.value.text,
    props.contentClass,
  ].join(' ')
})
</script>

<template>
  <PPopover
    class="pxd-tooltip"
    :position="position"
    :disabled="computedDisabled"
    :show-arrow="showArrow"
    :arrow-color="computedVariant.bg"
    :content-class="computedClasses"
    :content-style="contentStyle"
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
