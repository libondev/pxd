<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'

interface Props {
  as?: ComponentAs
  size?: ResponsiveValue<number | string>
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

  const defaultSize = {} as Record<string, string | number>

  if (typeof size === 'object') {
    return Object.entries(size).reduce((acc, [bp, value]) => {
      acc[`--text-${bp}`] = `${value}px`

      return acc
    }, defaultSize)
  } else {
    defaultSize['--text-xs'] = getCssUnitValue(size, '14px') as string
  }

  return defaultSize
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
  <component :is="as" :class="computedClass" :style="computedStyle">
    <slot />
  </component>
</template>
