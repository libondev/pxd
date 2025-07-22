<script setup lang="ts">
import type { ComponentLabel, ComponentVariant } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'
import { getFallbackValue } from '../../utils/value'

interface Props {
  size?: number | string
  inset?: boolean
  label?: ComponentLabel
  variant?: ComponentVariant | 'secondary'
}

const props = withDefaults(
  defineProps<Props>(),
  {
    size: 10,
    label: '',
    variant: 'primary',
  },
)

const variantPresets = {
  primary: 'bg-primary text-background',
  error: 'bg-red-700 text-background dark:text-gray-1000',
  warning: 'bg-amber-700 text-gray-1000 dark:text-gray-100',
  success: 'bg-green-700 text-background dark:text-gray-1000',
  secondary: 'bg-gray-700 text-background dark:text-gray-1000',
}

const computedClass = computed(() => {
  const classes = ['pxd-chip--label absolute border rounded-full border-background text-xs top-0 right-0 motion-safe:transition-all']

  const { variant, inset, label } = props

  if (!label) {
    classes.push('size-(--size)')
  }

  if (!inset) {
    classes.push('translate-x-1/2 -translate-y-1/3')
  }

  classes.push(getFallbackValue(variant, variantPresets, 'primary'))

  return classes.join(' ')
})
</script>

<template>
  <div class="pxd-chip inline-flex relative shrink-0">
    <slot />

    <span :data-label="label" :class="computedClass" :style="{ '--size': getCssUnitValue(size) }" />
  </div>
</template>

<style>
.pxd-chip--label:after {
  display: block;
  content: attr(data-label);
  transform: scale(0.875);
  padding-inline: 2px;
}
</style>
