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

  return getResponsiveValue(
    gap,
    (typeof gap === 'object' ? gap.xs : gap),
    (acc, bp, value) => acc[`--${bp}`] = `${Number(value) * scale}px`,
  )
})

const formattedDirection = computed(() => {
  const { direction } = props

  return getResponsiveValue(
    props.direction,
    (typeof direction === 'object' ? direction.xs : direction) ?? 'horizontal',
    (acc, bp, value) => {
      acc[bp] = presetDirClasses[`--${bp}:${value}` as keyof typeof presetDirClasses] as ComponentDirection
    },
  )
})

const computedClass = computed(() => {
  const classes = ['gap-(--xs) [--xs:16px]', presetAlignClasses[props.align], presetJustifyClasses[props.justify]]

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
  <Component
    :is="props.as"
    class="pxd-stack flex max-w-full"
    :class="computedClass"
    v-bind="$attrs"
    :style="formattedGap"
  >
    <slot />
  </Component>
</template>
