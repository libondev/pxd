<script lang="ts" setup>
import type { TooltipProps } from './types'
import { computed } from 'vue'
import { getFallbackValue } from '../../utils/helper'
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

const contentClassComputed = computed(() => {
  const classes = [
    'px-3 py-2 rounded-md text-13 break-words shadow-tooltip whitespace-pre-line bg-(--popover-arrow-color)',
    computedVariant.value.base,
    props.contentClass,
  ]

  return classes
})
</script>

<template>
  <PPopover
    role="tooltip"
    class="pxd-tooltip"
    :data-variant="variant"
    :position="position"
    :disabled="isDisabled"
    :show-arrow="showArrow"
    :show-delay="showDelay"
    :hide-delay="hideDelay"
    :fill-trigger-width="false"
    :trigger-selector="triggerSelector"
    wrapper-class="max-sm:data-[position^=top]:px-1 max-sm:data-[position^=bottom]:px-1 max-sm:data-[position^=left]:ps-1 max-sm:data-[position^=right]:pe-1"
    :arrow-color="computedVariant.bg"
    :content-class="contentClassComputed"
    :content-style="contentStyle"
    v-bind="$attrs"
  >
    <slot />

    <template #content="{ activeTrigger, activeTriggerIndex }">
      <slot
        name="content"
        :active-trigger="activeTrigger"
        :active-trigger-index="activeTriggerIndex"
      >
        {{ content }}
      </slot>
    </template>
  </PPopover>
</template>
