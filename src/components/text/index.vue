<script lang="ts" setup>
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'
import { getResponsiveValue } from '../../utils/responsive'
import { tv } from 'tailwind-variants'
import type { TextProps } from './types'

defineOptions({
  name: 'PText',
})

const props = withDefaults(defineProps<TextProps>(), {
  as: 'p',
  align: 'left',
  truncate: false,
})

const textVariant = tv({
  base: 'pxd-text m-0 shrink-0',
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    monospace: {
      true: 'font-mono',
      false: '',
    },
    secondary: {
      true: 'text-foreground-secondary',
      false: '',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    lineClamp: {
      true: 'line-clamp',
      false: '',
    },
  },
  defaultVariants: {
    align: 'left',
    monospace: false,
    secondary: false,
    truncate: false,
    lineClamp: false,
  },
})

const presetSize = {
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
    (acc, bp, value) => (acc[bp] = acc[`--text-${bp}`] = getCssUnitValue(value)),
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

const computedClasses = computed(() => {
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
    ...Object.keys(formattedSize.value).map((bp) => presetSize[bp as keyof typeof presetSize]),
  ]
    .filter(Boolean)
    .join(' ')

  return classes
})
</script>

<template>
  <Component :is="as" :class="computedClasses" :title="text" :style="computedStyle">
    <slot>
      {{ text }}
    </slot>
  </Component>
</template>
