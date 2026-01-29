<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'
import { getResponsiveValue } from '../../utils/responsive'
import { textVariant } from './cn'

interface Props {
  as?: ComponentAs
  size?: ResponsiveValue<string | number>
  align?: 'left' | 'center' | 'right'
  truncate?: boolean | number | string
  monospace?: boolean
  secondary?: boolean
}

defineOptions({
  name: 'PText',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'p',
    align: 'left',
    truncate: false,
  },
)

const presetSizeClasses = {
  '--text-xs': 'text-xs',
  '--text-sm': 'sm:text-sm',
  '--text-md': 'md:text-md',
  '--text-lg': 'lg:text-lg',
  '--text-xl': 'xl:text-xl',
}

const formattedSize = computed(() => {
  const { size } = props

  return getResponsiveValue(
    size,
    (typeof size === 'object' ? size.xs : size) ?? '14px',
    (acc, bp, value) => acc[bp] = acc[`--text-${bp}`] = getCssUnitValue(value),
  )
})

const computedStyle = computed(() => {
  const { truncate } = props

  const styles = {
    ...formattedSize.value,
  }

  if (truncate && typeof truncate !== 'boolean') {
    styles['--line-clamp'] = truncate
  }

  return styles
})

const computedClass = computed(() => {
  const { truncate, monospace, secondary } = props

  const baseClass = textVariant({
    align: props.align,
    monospace,
    secondary,
    truncate: truncate === true,
    lineClamp: typeof truncate === 'number',
  })

  const classes = [
    baseClass,
    ...Object.keys(formattedSize.value).map(bp => presetSizeClasses[bp as keyof typeof presetSizeClasses]),
  ].filter(Boolean).join(' ')

  return classes
})
</script>

<template>
  <Component :is="as" :class="computedClass" :style="computedStyle">
    <slot />
  </Component>
</template>
