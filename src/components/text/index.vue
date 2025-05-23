<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/components'
import { computed } from 'vue'

interface Props {
  as?: ComponentAs
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
    '--text-xs': '14px',
  } as Record<string, string | number>

  if (typeof size === 'object') {
    return Object.entries(size).reduce((acc, [bp, value]) => {
      acc[`--text-${bp}`] = `${value}px`

      return acc
    }, defaultSize)
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
  if (truncate === true || truncate === '') {
    basic.push('truncate')
  } else if (truncate) {
    basic.push(`line-clamp`)
  }

  return basic
})
</script>

<template>
  <component :is="as" :class="computedClasses" :style="computedStyle">
    <slot />
  </component>
</template>
