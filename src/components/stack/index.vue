<script lang="ts" setup>
import type { ComponentAs, ComponentDirection, ResponsiveValue } from '../../types/shared'
import { computed } from 'vue'

export interface Props {
  as?: ComponentAs
  wrap?: boolean
  gap?: ResponsiveValue<number | string>
  scale?: number
  align?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  direction?: ResponsiveValue<ComponentDirection>
}

defineOptions({
  name: 'PStack',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'div',
    wrap: true,
    scale: 4,
    align: 'start',
    justify: 'start',
    direction: 'horizontal',
  },
)

const presetDirClasses = {
  'xs:vertical': 'flex-col',
  'xs:horizontal': 'flex-row',
  'sm:vertical': 'sm:flex-col',
  'sm:horizontal': 'sm:flex-row',
  'md:vertical': 'md:flex-col',
  'md:horizontal': 'md:flex-row',
  'lg:vertical': 'lg:flex-col',
  'lg:horizontal': 'lg:flex-row',
  'xl:vertical': 'xl:flex-col',
  'xl:horizontal': 'xl:flex-row',
}

const presetGapClasses = {
  '--gap-xs': 'gap-(--gap-xs)',
  '--gap-sm': 'sm:gap-(--gap-sm)',
  '--gap-md': 'md:gap-(--gap-md)',
  '--gap-lg': 'lg:gap-(--gap-lg)',
  '--gap-xl': 'xl:gap-(--gap-xl)',
}

const presetAlignClasses = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  between: 'items-between',
  around: 'items-around',
  evenly: 'items-evenly',
  stretch: 'items-stretch',
}

const presetJustifyClasses = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
  stretch: 'justify-stretch',
}

const formattedGap = computed(() => {
  const { gap, scale } = props

  const defaultXsGap = (typeof gap === 'object' ? gap.xs : gap) || 2

  const defaultGap = {
    '--gap-xs': `${Number(defaultXsGap) * scale}px`,
  } as Record<string, string>

  if (typeof gap === 'object') {
    return Object.entries(gap).reduce((acc, [bp, value]) => {
      acc[`--gap-${bp}`] = `${Number(value) * scale}px`

      return acc
    }, defaultGap)
  }

  return defaultGap
})

const formattedDirection = computed(() => {
  const { direction } = props

  const defaultDirection = typeof direction === 'string' ? direction : direction.xs || 'horizontal'
  const defaultDirs = { xs: defaultDirection === 'horizontal' ? 'flex-row' : 'flex-col' } as Record<string, string>

  if (typeof direction === 'object') {
    return Object.entries(direction).reduce((acc, [bp, value]) => {
      acc[bp] = presetDirClasses[`${bp}:${value}` as keyof typeof presetDirClasses]

      return acc
    }, defaultDirs)
  }

  return defaultDirs
})

const computedClass = computed(() => {
  const classes = ['pxd-stack flex w-full', presetAlignClasses[props.align], presetJustifyClasses[props.justify]]

  if (props.wrap) {
    classes.push('flex-wrap')
  }

  classes.push(
    ...Object.values(formattedDirection.value),
    ...Object.keys(formattedGap.value).map(bp => presetGapClasses[bp as keyof typeof presetGapClasses]),
  )

  return classes.filter(Boolean).join(' ')
})
</script>

<template>
  <component :is="props.as" :class="computedClass" v-bind="$attrs" :style="formattedGap">
    <slot />
  </component>
</template>
