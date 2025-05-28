<script lang="ts" setup>
import type { ComponentAs, ResponsiveValue } from '../../types/components'
import { computed } from 'vue'

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
    wrap: true,
    scale: 4,
    align: 'start',
    justify: 'start',
    direction: 'row',
  },
)

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
  const { gap = 2, scale } = props

  const defaultGap = {
    '--gap-xs': `${Number(gap) * scale}px`,
  } as Record<string, string>

  if (typeof gap === 'object') {
    return Object.entries(gap).reduce((acc, [bp, value]) => {
      acc[`--gap-${bp}`] = `${value * scale}px`

      return acc
    }, defaultGap)
  }

  return defaultGap
})

const formattedDir = computed(() => {
  const { direction } = props

  const defaultDir = { xs: props.direction === 'col' ? 'flex-col' : 'flex-row' } as Record<string, string>

  if (typeof direction === 'object') {
    return Object.entries(direction).reduce((acc, [bp, value]) => {
      acc[bp] = presetDirClasses[`${bp}:${value}` as keyof typeof presetDirClasses]

      return acc
    }, defaultDir)
  }

  return defaultDir
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
</script>

<template>
  <component :is="props.as" :class="computedClasses" :style="formattedGap">
    <slot />
  </component>
</template>
