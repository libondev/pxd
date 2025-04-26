<script lang="ts" setup>
import type { ComponentBreakpointKeys } from '../../types/components'
import { computed } from 'vue'

defineOptions({
  name: 'PStack',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    direction: 'col',
    gap: 2,
  },
)

type ResponsiveValue<T> = T | Partial<Record<ComponentBreakpointKeys, T>>

interface Props {
  gap?: number | ResponsiveValue<number>
  direction?: 'row' | 'col' | ResponsiveValue<'row' | 'col'>
}

const presetDirClasses = {
  'xs:col': 'xs:flex-col',
  'sm:col': 'sm:flex-col',
  'md:col': 'md:flex-col',
  'lg:col': 'lg:flex-col',
  'xl:col': 'xl:flex-col',
  'xs:row': 'xs:flex-row',
  'sm:row': 'sm:flex-row',
  'md:row': 'md:flex-row',
  'lg:row': 'lg:flex-row',
  'xl:row': 'xl:flex-row',
}

const presetGapClasses = {
  xs: 'gap-(--xs-gap)',
  sm: 'sm:gap-(--sm-gap)',
  md: 'md:gap-(--md-gap)',
  lg: 'lg:gap-(--lg-gap)',
  xl: 'xl:gap-(--xl-gap)',
}

const classes = computed(() => {
  const basic = ['pxd-stack flex', getDirectionClasses()]

  if (typeof props.gap === 'number') {
    basic.push('gap-(--gap)')
  }
  else if (typeof props.gap === 'object') {
    basic.push(
      Object.keys(props.gap).map(bp => presetGapClasses[bp as keyof typeof presetGapClasses]).join(' '),
    )
  }

  return basic
})

const calcGapSize = computed(() => {
  const gap = props.gap ?? 1

  if (typeof gap === 'number') {
    return `--gap: ${gap * 4}px`
  }

  return Object.entries(gap).map(([bp, value]) => {
    return `--${bp}-gap: ${value * 4}px`
  }).join(';')
})

function getDirectionClasses() {
  const direction = props.direction

  switch (typeof direction) {
    case 'string':
      return direction === 'col' ? 'flex-col' : 'flex-row'
    case 'object':
      return Object.entries(direction).map(([breakpoint, value]) => {
        return presetDirClasses[`${breakpoint}:${value}` as keyof typeof presetDirClasses]
      }).join(' ')
    default:
      return 'flex-col'
  }
}
</script>

<template>
  <div :class="classes" :style="calcGapSize">
    <slot />
  </div>
</template>
