<script lang="ts" setup>
import type { ComponentDirection } from '../../types/shared'
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/responsive'
import { stackVariant } from './cn'
import type { StackProps } from './types'

defineOptions({
  name: 'PStack',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StackProps>(), {
  as: 'div',
  wrap: true,
  scale: 4,
  align: 'start',
  justify: 'start',
})

const presetDir = {
  '--xs:vertical': 'flex-col',
  '--xs:horizontal': 'flex-row',
  '--sm:vertical': 'sm:flex-col',
  '--sm:horizontal': 'sm:flex-row',
  '--md:vertical': 'md:flex-col',
  '--md:horizontal': 'md:flex-row',
  '--lg:vertical': 'lg:flex-col',
  '--lg:horizontal': 'lg:flex-row',
  '--xl:vertical': 'xl:flex-col',
  '--xl:horizontal': 'xl:flex-row',
}

const presetGap = {
  '--xs': 'gap-(--xs)',
  '--sm': 'sm:gap-(--sm)',
  '--md': 'md:gap-(--md)',
  '--lg': 'lg:gap-(--lg)',
  '--xl': 'xl:gap-(--xl)',
}

const formattedGap = computed(() => {
  const { gap, scale } = props

  return getResponsiveValue(
    gap,
    typeof gap === 'object' ? gap.xs : gap,
    (acc, bp, value) => (acc[`--${bp}`] = `${Number(value) * scale}px`),
  )
})

const formattedDirection = computed(() => {
  const { direction } = props

  return getResponsiveValue(
    props.direction,
    (typeof direction === 'object' ? direction.xs : direction) ?? 'horizontal',
    (acc, bp, value) => {
      acc[bp] = presetDir[`--${bp}:${value}` as keyof typeof presetDir] as ComponentDirection
    },
  )
})

const computedClasses = computed(() => {
  const baseClass = stackVariant({
    wrap: props.wrap,
    align: props.align,
    justify: props.justify,
  })

  const classes = [
    baseClass,
    ...Object.values(formattedDirection.value),
    ...Object.keys(formattedGap.value).map((bp) => presetGap[bp as keyof typeof presetGap]),
  ]
    .filter(Boolean)
    .join(' ')

  return classes
})
</script>

<template>
  <Component
    :is="props.as"
    class="pxd-stack flex max-w-full"
    :class="computedClasses"
    v-bind="$attrs"
    :style="formattedGap"
  >
    <slot />
  </Component>
</template>
