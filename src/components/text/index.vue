<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import { getResponsiveValue } from '../../utils/responsive'

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
    variant: 'default',
    truncate: false,
  },
)

const presetAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const presetSizeClasses = {
  '--text-xs': 'text-xs',
  '--text-sm': 'sm:text-sm',
  '--text-md': 'md:text-md',
  '--text-lg': 'lg:text-lg',
  '--text-xl': 'xl:text-xl',
}

const formattedSize = computed(() => {
  const { size } = props

  const defaultSize = {
    '--text-xs': getCssUnitValue(typeof size === 'object' ? size.xs : size, '14px'),
  }

  return getResponsiveValue(size, defaultSize, (acc, bp, value) => {
    acc[`--text-${bp}`] = `${value}px`
  })
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

  const classes = [
    'pxd-text m-0',
    presetAlignClasses[props.align],
    ...Object.keys(formattedSize.value).map(bp => presetSizeClasses[bp as keyof typeof presetSizeClasses]),
  ]

  if (monospace) {
    classes.push('font-mono')
  }

  if (secondary) {
    classes.push('text-foreground-secondary')
  }

  if (isTruthyProp(truncate)) {
    classes.push('truncate')
  } else if (truncate) {
    classes.push(`line-clamp`)
  }

  return classes.join(' ')
})
</script>

<template>
  <Component :is="as" :class="computedClass" :style="computedStyle">
    <slot />
  </component>
</template>
