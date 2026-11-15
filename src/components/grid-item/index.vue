<script lang="ts" setup>
import type { GridItemProps } from './types'
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/helper.js'

defineOptions({
  name: 'PGridItem',
  inheritAttrs: false,
})

const props = defineProps<GridItemProps>()

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
  const toClasses = (formatted: object, axis: 'row' | 'col') =>
    Object.keys(formatted).map((key) => {
      const bp = key.split('-')[2]
      const prefix = bp === 'xs' ? '' : bp + ':'

      return `${prefix}${axis}-(${key})`
    })

  const classes = [...toClasses(formattedRow.value, 'row'), ...toClasses(formattedCol.value, 'col')]

  return classes
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
    data-grid-item
    class="pxd-grid-item overflow-hidden"
    :class="computedClasses"
    :style="gridItemStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
