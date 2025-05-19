<script lang="ts" setup>
import type { ComponentAs, ComponentBreakpointKeys } from '../../types/components'
import { computed } from 'vue'

type ResponsiveValue<T> = T | Partial<Record<ComponentBreakpointKeys, T>>

export interface Props {
  as?: ComponentAs
  wrap?: boolean
  gap?: number | string | ResponsiveValue<number>
  scale?: number
  align?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  direction?: 'row' | 'col' | ResponsiveValue<'row' | 'col'>
}

defineOptions({
  name: 'PStack',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'div',
    gap: 2,
    wrap: true,
    scale: 4,
    align: 'start',
    justify: 'start',
    direction: 'row',
  },
)

const DEFAULT_GAP = 2

const presetDirClasses = {
  'xs:col': 'flex-col',
  'xs:row': 'flex-row',
  'sm:col': 'sm:flex-col',
  'sm:row': 'sm:flex-row',
  'md:col': 'md:flex-col',
  'md:row': 'md:flex-row',
  'lg:col': 'lg:flex-col',
  'lg:row': 'lg:flex-row',
  'xl:col': 'xl:flex-col',
  'xl:row': 'xl:flex-row',
}

const presetGapClasses = {
  xs: 'gap-(--xs-gap)',
  sm: 'sm:gap-(--sm-gap)',
  md: 'md:gap-(--md-gap)',
  lg: 'lg:gap-(--lg-gap)',
  xl: 'xl:gap-(--xl-gap)',
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

  if (typeof gap === 'object') {
    return Object.entries(gap).reduce((acc, [bp, value]) => {
      acc[bp] = value * scale

      return acc
    }, { xs: DEFAULT_GAP * scale } as Record<string, number>)
  }

  return {
    xs: Number(gap) * scale,
  }
})

const formattedDir = computed(() => {
  const { direction } = props

  const defaultBreakpoints: Record<string, string> = { '': props.direction === 'col' ? 'flex-col' : 'flex-row' }

  if (typeof direction === 'string') {
    return defaultBreakpoints
  }

  return Object.entries(direction).reduce((acc, [bp, value]) => {
    acc[bp] = presetDirClasses[`${bp}:${value}` as keyof typeof presetDirClasses]

    return acc
  }, defaultBreakpoints)
})

const computedClasses = computed(() => {
  const basic = ['pxd-stack flex', presetAlignClasses[props.align], presetJustifyClasses[props.justify]]

  if (props.wrap) {
    basic.push('flex-wrap')
  }

  basic.push(
    ...Object.values(formattedDir.value),
    ...Object.keys(formattedGap.value).map(bp => presetGapClasses[bp as keyof typeof presetGapClasses]),
  )

  return basic.join(' ')
})

const gapSizeStyles = computed(() => {
  return Object.entries(formattedGap.value).map(([bp, value]) => {
    return `--${bp}-gap: ${value}px`
  }).join(';')
})
</script>

<template>
  <component :is="props.as" :class="computedClasses" :style="gapSizeStyles">
    <slot />
  </component>
</template>
