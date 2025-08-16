<script lang="ts" setup>
import type { ComponentAs, ComponentDirection, ResponsiveValue } from '../../types/shared'
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/responsive'

type Align = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'

export interface Props {
  as?: ComponentAs
  wrap?: boolean
  gap?: ResponsiveValue<string | number>
  scale?: number
  align?: Align
  justify?: Align
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
  },
)

const presetDirClasses = {
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

const presetGapClasses = {
  '--xs': 'gap-(--xs)',
  '--sm': 'sm:gap-(--sm)',
  '--md': 'md:gap-(--md)',
  '--lg': 'lg:gap-(--lg)',
  '--xl': 'xl:gap-(--xl)',
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

  const defaultXsGap = (typeof gap === 'object' ? gap.xs : gap) ?? 4

  const gapMap = {
    '--xs': `${Number(defaultXsGap) * scale}px`,
  }

  return getResponsiveValue(gap, gapMap, (acc, bp, value) => {
    acc[`--${bp}`] = `${Number(value) * scale}px`
  })
})

const formattedDirection = computed(() => {
  const { direction } = props

  const defaultDirection = (typeof direction === 'object' ? direction.xs : direction) ?? 'horizontal'
  const defaultDirs = {
    xs: presetDirClasses[`--xs:${defaultDirection}`],
  }

  return getResponsiveValue(direction, defaultDirs, (acc, bp, value) => {
    acc[bp] = presetDirClasses[`--${bp}:${value}` as keyof typeof presetDirClasses]
  })
})

const computedClass = computed(() => {
  const classes = ['pxd-stack flex max-w-full', presetAlignClasses[props.align], presetJustifyClasses[props.justify]]

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
  <Component :is="props.as" :class="computedClass" :data-direction="direction" v-bind="$attrs" :style="formattedGap">
    <slot />
  </component>
</template>
