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
  variant: 'default',
  position: 'top',
  showArrow: true,
  showDelay: 300,
  hideDelay: 300,
})

const VARIANTS = {
  invert: {
    bg: 'var(--color-background-100)',
    base: 'text-foreground border',
  },
  default: {
    bg: 'var(--color-gray-1000)',
    base: 'text-gray-100',
  },
  error: {
    bg: 'var(--color-red-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
  warning: {
    bg: 'var(--color-amber-700)',
    base: 'text-gray-1000 dark:text-gray-100',
  },
  success: {
    bg: 'var(--color-green-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
  violet: {
    bg: 'var(--color-purple-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
}

const computedVariant = computed(() => getFallbackValue(props.variant, VARIANTS, 'default'))

const isDisabled = computed(() => {
  return props.disabled || (props.desktopOnly && isTouchDevice())
})

const computedClasses = computed(() => {
  return [
    'px-3 py-2 rounded-md text-sm break-words shadow-tooltip whitespace-pre-line bg-(--popover-arrow-color)',
    computedVariant.value.base,
    props.contentClass,
  ].join(' ')
})
</script>

<template>
  <PPopover
    role="tooltip"
    class="pxd-tooltip"
    :position="position"
    :disabled="isDisabled"
    :show-arrow="showArrow"
    :show-delay="showDelay"
    :hide-delay="hideDelay"
    wrapper-class="max-sm:data-[position^=top]:px-1 max-sm:data-[position^=bottom]:px-1 max-sm:data-[position^=left]:pl-1 max-sm:data-[position^=right]:pr-1"
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
