<script lang="ts" setup>
import type { GridItemProps } from './types'
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/get'

defineOptions({
  name: 'PGridItem',
  inheritAttrs: false,
})

const props = defineProps<GridItemProps>()

const presetGridRow = {
  '--xs-row': 'row-(--xs-row)',
  '--sm-row': 'sm:row-(--sm-row)',
  '--md-row': 'md:row-(--md-row)',
  '--lg-row': 'lg:row-(--lg-row)',
  '--xl-row': 'xl:row-(--xl-row)',
}

const presetGridCol = {
  '--xs-col': 'col-(--xs-col)',
  '--sm-col': 'sm:col-(--sm-col)',
  '--md-col': 'md:col-(--md-col)',
  '--lg-col': 'lg:col-(--lg-col)',
  '--xl-col': 'xl:col-(--xl-col)',
}

const formattedRow = computed(() => {
  const { row } = props
  return getResponsiveValue(
    row,
    (typeof row === 'object' ? row.xs : row) ?? 'auto',
    (acc, bp, value) => {
      acc[`--${bp}-row`] = value
    },
  )
})

const formattedCol = computed(() => {
  const { column } = props
  return getResponsiveValue(
    column,
    (typeof column === 'object' ? column.xs : column) ?? 'auto',
    (acc, bp, value) => {
      acc[`--${bp}-col`] = value
    },
  )
})

const computedClasses = computed(() => {
  return [
    ...Object.keys(formattedRow.value).map((bp) => presetGridRow[bp as keyof typeof presetGridRow]),
    ...Object.keys(formattedCol.value).map((bp) => presetGridCol[bp as keyof typeof presetGridCol]),
  ].join(' ')
})

const gridItemStyle = computed(() => {
  return {
    ...formattedRow.value,
    ...formattedCol.value,
  }
})
</script>

<template>
  <div
    class="pxd-grid-item overflow-hidden"
    :class="computedClasses"
    :style="gridItemStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
