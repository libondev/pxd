<script setup lang="ts">
import { computed } from 'vue'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import type { ChipProps } from './types'
import { tv } from 'tailwind-variants'

defineOptions({
  name: 'PChip',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ChipProps>(), {
  size: 10,
  label: '',
  variant: 'primary',
})

const chipVariant = tv({
  base: 'pxd-chip--label text-xs top-0 right-0 absolute rounded-full border border-background-100 motion-safe:transition-all',
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
  defaultVariants: {
    variant: 'primary',
    inset: false,
    hasLabel: false,
  },
})

const computedClasses = computed(() => {
  return chipVariant({
    inset: props.inset,
    variant: props.variant,
    hasLabel: isTruthyProp(props.label),
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
