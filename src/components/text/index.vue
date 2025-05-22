<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { getFallbackVariant } from '../../composables/useFallbackProps'

interface Props {
  as?: ComponentAs
  color?: string
  size?: string | number | ResponsiveValue<number>
  align?: 'left' | 'center' | 'right'
  variant?: keyof typeof VARIANTS
  truncate?: boolean | number
  monospace?: boolean
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

const VARIANTS = {
  default: 'text-foreground',
}

const presetAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const presetSizeClasses = {
  xs: 'fs-xs',
  sm: 'sm:fs-sm',
  md: 'md:fs-md',
  lg: 'lg:fs-lg',
  xl: 'xl:fs-xl',
}

const formattedSize = computed(() => {
  const { size } = props

  if (typeof size === 'object') {
    return Object.entries(size).reduce((acc, [bp, value]) => {
      acc[bp] = value

      return acc
    }, { xs: 16 } as Record<string, number>)
  }

  return {
    xs: size as number,
  }
})

const computedStyle = computed(() => {
  const styles = Object.entries(formattedSize.value).reduce((acc, [bp, value]) => {
    acc[`--fs-${bp}`] = value

    return acc
  }, {} as typeof formattedSize.value)

  if (typeof props.truncate === 'number') {
    styles['--text-clamp'] = props.truncate
  }

  return styles
})

const computedClasses = computed(() => {
  const { truncate, monospace } = props

  const basic = [
    'pxd-text m-0',
    getFallbackVariant(props.variant, VARIANTS),
    presetAlignClasses[props.align],
    ...Object.keys(formattedSize.value).map(bp => presetSizeClasses[bp as keyof typeof presetSizeClasses]),
  ]

  if (monospace) {
    basic.push('font-mono')
  }

  if (truncate) {
    if (typeof props.truncate === 'boolean') {
      basic.push('truncate')
    } else if (typeof truncate === 'number') {
      basic.push(`text-clamp`)
    }
  }

  return twMerge(basic)
})
</script>

<template>
  <component :is="as" :class="computedClasses" :style="computedStyle" v-bind="$attrs">
    <slot />
  </component>
</template>
