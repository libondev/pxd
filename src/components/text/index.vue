<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/components'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  as?: ComponentAs
  color?: string
  size?: string | number | ResponsiveValue<number>
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
    size: 14,
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
  xs: 'text-(length:--xs)',
  sm: 'sm:text-(length:--sm)',
  md: 'md:text-(length:--md)',
  lg: 'lg:text-(length:--lg)',
  xl: 'xl:text-(length:--xl)',
}

const formattedSize = computed(() => {
  const { size } = props

  if (typeof size === 'object') {
    return Object.entries(size).reduce((acc, [bp, value]) => {
      acc[bp] = `${value}px`

      return acc
    }, { xs: '14px' } as Record<string, string>)
  }

  return {
    xs: getCssUnitValue(size)!,
  }
})

const computedStyle = computed(() => {
  const { truncate } = props

  const styles = {
    ...Object.entries(formattedSize.value).reduce((acc, [bp, value]) => {
      acc[`--${bp}`] = value

      return acc
    }, {} as typeof formattedSize.value),
  }

  if (typeof truncate !== 'boolean' && truncate !== '') {
    styles['--line-clamp'] = truncate as string
  }

  return styles
})

const computedClasses = computed(() => {
  const { truncate, monospace, secondary } = props

  const basic = [
    'pxd-text m-0',
    presetAlignClasses[props.align],
    ...Object.keys(formattedSize.value).map(bp => presetSizeClasses[bp as keyof typeof presetSizeClasses]),
  ]

  if (monospace) {
    basic.push('font-mono')
  }

  if (secondary) {
    basic.push('text-foreground-secondary')
  }

  // hack vue2 boolean prop
  if (truncate || truncate === '') {
    if (typeof truncate === 'boolean' || truncate === '') {
      basic.push('truncate')
    } else {
      basic.push(`line-clamp`)
    }
  }

  return basic
})
</script>

<template>
  <component :is="as" :class="computedClasses" :style="computedStyle">
    <slot />
  </component>
</template>
