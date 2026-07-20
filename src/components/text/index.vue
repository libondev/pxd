<script lang="ts" setup>
import type { TextProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { getCssUnitValue } from '../../utils/format'
import { getResponsiveValue } from '../../utils/helper'

defineOptions({
  name: 'PText',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextProps>(), {
  as: 'p',
  align: 'left',
})

const { attrs, classes: variantClasses } = useTailwindVariant(
  {
    base: 'pxd-text m-0 shrink-0',
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      monospace: {
        true: 'font-mono',
      },
      secondary: {
        true: 'text-foreground-secondary',
      },
    },
  },
  {
    selection: () => ({
      align: props.align,
      monospace: props.monospace,
      secondary: props.secondary,
    }),
  },
)

const presetSize = {
  '--text-xs': 'text-xs',
  '--text-sm': 'sm:text-sm',
  '--text-md': 'md:text-md',
  '--text-lg': 'lg:text-lg',
  '--text-xl': 'xl:text-xl',
}

const computedStyle = computed(() => {
  const { size } = props

  return getResponsiveValue(
    size,
    (typeof size === 'object' ? size.xs : size) ?? '14px',
    (acc, bp, value) => (acc[bp] = acc[`--text-${bp}`] = getCssUnitValue(value)),
  )
})

const computedClasses = computed(() => {
  const classes = [
    variantClasses.value,
    ...Object.keys(computedStyle.value).map((bp) => presetSize[bp as keyof typeof presetSize]),
  ].filter(Boolean)

  return classes
})
</script>

<template>
  <Component :is="as" :class="computedClasses" :title="text" :style="computedStyle" v-bind="attrs">
    <slot>
      {{ text }}
    </slot>
  </Component>
</template>
