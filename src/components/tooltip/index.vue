<script lang="ts" setup>
import type { TooltipProps } from './types'
import { computed } from 'vue'
import { TOOLTIP_CONTENT_CLASS, TOOLTIP_VARIANTS } from '../../constants/tooltip-variants.js'
import { getFallbackValue } from '../../utils/helper.js'
import { isTouchDevice } from '../../utils/is.js'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PTooltip',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipProps>(), {
  variant: 'default',
  position: 'top',
  showDelay: 300,
  hideDelay: 300,
})

const computedVariant = computed(() => getFallbackValue(props.variant, TOOLTIP_VARIANTS, 'default'))

const isDisabled = computed(() => {
  return props.disabled || (props.desktopOnly && isTouchDevice())
})

const contentClassComputed = computed(() => {
  const classes = [
    'px-3 py-2',
    TOOLTIP_CONTENT_CLASS,
    computedVariant.value.base,
    props.contentClass,
  ]

  return classes
})
</script>

<template>
  <PPopover
    data-tooltip
    role="tooltip"
    class="pxd-tooltip"
    :data-variant="variant"
    :position="position"
    :disabled="isDisabled"
    :show-delay="showDelay"
    :hide-delay="hideDelay"
    :fill-trigger-width="false"
    wrapper-class="max-sm:data-[position^=top]:px-1 max-sm:data-[position^=bottom]:px-1 max-sm:data-[position^=left]:ps-1 max-sm:data-[position^=right]:pe-1"
    :arrow-color="computedVariant.bg"
    :content-class="contentClassComputed"
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
