<script lang="ts" setup>
import type { ResponsiveValue } from '../../types/shared/props'
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/responsive'

interface Props {
  rows?: ResponsiveValue<string | number>
  columns?: ResponsiveValue<string | number>
}

defineOptions({
  name: 'PGrid',
  inheritAttrs: false,
})

const props = defineProps<Props>()

const presetGridRows = {
  '--xs-rows': 'grid-rows-(--xs-rows)',
  '--sm-rows': 'sm:grid-rows-(--sm-rows)',
  '--md-rows': 'md:grid-rows-(--md-rows)',
  '--lg-rows': 'lg:grid-rows-(--lg-rows)',
  '--xl-rows': 'xl:grid-rows-(--xl-rows)',
}

const presetGridCols = {
  '--xs-cols': 'grid-cols-(--xs-cols)',
  '--sm-cols': 'sm:grid-cols-(--sm-cols)',
  '--md-cols': 'md:grid-cols-(--md-cols)',
  '--lg-cols': 'lg:grid-cols-(--lg-cols)',
  '--xl-cols': 'xl:grid-cols-(--xl-cols)',
}

const formattedRows = computed(() => {
  const { rows } = props

  return getResponsiveValue(
    rows,
    (typeof rows === 'object' ? rows.xs : rows) ?? 0,
    (acc, bp, value) => acc[`--${bp}-rows`] = `repeat(${value}, minmax(0, 1fr))`,
  )
})

const formattedCols = computed(() => {
  const { columns } = props

  return getResponsiveValue(
    columns,
    (typeof columns === 'object' ? columns.xs : columns) ?? 1,
    (acc, bp, value) => acc[`--${bp}-cols`] = `repeat(${value}, minmax(0, 1fr))`,
  )
})

const computedClass = computed(() => {
  return [
    ...Object.keys(formattedRows.value).map(bp => presetGridRows[bp as keyof typeof presetGridRows]),
    ...Object.keys(formattedCols.value).map(bp => presetGridCols[bp as keyof typeof presetGridCols]),
  ].join(' ')
})

const computedStyle = computed(() => {
  return {
    ...formattedRows.value,
    ...formattedCols.value,
  }
})
</script>

<template>
  <div class="pxd-grid relative grid max-w-full" :class="computedClass" :style="computedStyle" v-bind="$attrs">
    <slot />
  </div>
</template>
