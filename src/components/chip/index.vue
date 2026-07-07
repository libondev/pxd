<script lang="ts" setup>
import type { ChipProps } from './types'
import { isNil } from 'es-toolkit'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PChip',
  inheritAttrs: false,
})

const props = defineProps<ChipProps>()

const { classes: chipClasses } = useTailwindVariant(
  {
    base: 'pxd-chip--label text-xs top-0 right-0 absolute z-1 rounded-full border border-background-100 motion-safe:transition-appearance',
    variants: {
      variant: {
        primary: 'bg-primary text-background-100',
        error: 'bg-red-700 text-background-100 dark:text-gray-1000',
        warning: 'bg-amber-700 text-gray-1000 dark:text-gray-100',
        success: 'bg-green-700 text-background-100 dark:text-gray-1000',
        secondary: 'bg-gray-700 text-background-100 dark:text-gray-1000',
      },
      inset: {
        true: {},
        false: 'translate-x-1/2 -translate-y-1/3',
      },
      hasLabel: {
        true: {},
        false: 'size-(--chip-size)',
      },
    },
  },
  { mergeAttrsClass: false },
)

const computedClasses = computed(() => {
  return chipClasses({
    inset: props.inset,
    variant: props.variant,
    hasLabel: !isNil(props.label),
  })
})
</script>

<template>
  <div class="pxd-chip relative inline-flex shrink-0" v-bind="$attrs">
    <slot />

    <span
      :data-label="label"
      :class="computedClasses"
      :style="{ '--chip-size': getCssUnitValue(size) }"
    />
  </div>
</template>

<style>
.pxd-chip--label::after {
  display: block;
  content: attr(data-label);
  transform: scale(0.875);
  padding-inline: 2px;
}
</style>
