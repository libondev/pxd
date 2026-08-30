<script lang="ts" setup>
import type { ChipProps } from './types'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { getCssUnitValue } from '../../utils/format.js'
import { isNil } from '../../utils/is.js'

defineOptions({
  name: 'PChip',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'primary',
})

const { classes } = useTailwindVariant(
  {
    base: 'pxd-chip--label text-xs top-0 right-0 absolute z-1 rounded-full border border-background-100 motion-safe:transition-colors',
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        error: 'bg-red-700 text-gray-100 dark:text-gray-1000',
        warning: 'bg-amber-700 text-gray-1000 dark:text-gray-100',
        success: 'bg-green-700 text-gray-100 dark:text-gray-1000',
        secondary: 'bg-gray-700 text-gray-100 dark:text-gray-1000',
      },
      inset: {
        false: 'translate-x-1/2 -translate-y-1/3',
      },
      hasLabel: {
        false: 'size-(--chip-size)',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      inset: props.inset,
      variant: props.variant,
      hasLabel: !isNil(props.label),
    }),
  },
)
</script>

<template>
  <div class="pxd-chip relative inline-flex shrink-0" :data-variant="variant" v-bind="$attrs">
    <slot />

    <span :data-label="label" :class="classes" :style="{ '--chip-size': getCssUnitValue(size) }" />
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
