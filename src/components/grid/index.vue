<script lang="ts" setup>
import { computed } from 'vue'
import { getResponsiveValue } from '../../utils/responsive'
import type { GridProps } from './types'

defineOptions({
  name: 'PGrid',
  inheritAttrs: false,
})

const props = defineProps<GridProps>()

const presetGridRows = {
  '--xs-rows': 'grid-rows-(--xs-rows) [--rows-count:var(--xs-rows-count)]',
  '--sm-rows': 'sm:grid-rows-(--sm-rows) sm:[--rows-count:var(--sm-rows-count)]',
  '--md-rows': 'md:grid-rows-(--md-rows) md:[--rows-count:var(--md-rows-count)]',
  '--lg-rows': 'lg:grid-rows-(--lg-rows) lg:[--rows-count:var(--lg-rows-count)]',
  '--xl-rows': 'xl:grid-rows-(--xl-rows) xl:[--rows-count:var(--xl-rows-count)]',
}

const presetGridCols = {
  '--xs-cols': 'grid-cols-(--xs-cols) [--cols-count:var(--xs-cols-count)]',
  '--sm-cols': 'sm:grid-cols-(--sm-cols) sm:[--cols-count:var(--sm-cols-count)]',
  '--md-cols': 'md:grid-cols-(--md-cols) md:[--cols-count:var(--md-cols-count)]',
  '--lg-cols': 'lg:grid-cols-(--lg-cols) lg:[--cols-count:var(--lg-cols-count)]',
  '--xl-cols': 'xl:grid-cols-(--xl-cols) xl:[--cols-count:var(--xl-cols-count)]',
}

const formattedRows = computed(() => {
  const { rows, debug } = props

  return getResponsiveValue(
    rows,
    (typeof rows === 'object' ? rows.xs : rows) ?? 0,
    (acc, bp, value) => {
      acc[`--${bp}-rows`] = `repeat(${value}, minmax(0, 1fr))`

      if (debug) {
        acc[`--${bp}-rows-count`] = value || 1
      }
    },
  )
})

const formattedCols = computed(() => {
  const { columns, debug } = props

  return getResponsiveValue(
    columns,
    (typeof columns === 'object' ? columns.xs : columns) ?? 1,
    (acc, bp, value) => {
      acc[`--${bp}-cols`] = `repeat(${value}, minmax(0, 1fr))`

      if (debug) {
        acc[`--${bp}-cols-count`] = value || 1
      }
    },
  )
})

const computedClasses = computed(() => {
  return [
    'pxd-grid relative grid max-w-full',
    ...Object.keys(formattedRows.value).map(
      (bp) => presetGridRows[bp as keyof typeof presetGridRows],
    ),
    ...Object.keys(formattedCols.value).map(
      (bp) => presetGridCols[bp as keyof typeof presetGridCols],
    ),
    props.debug ? 'debug' : '',
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
  <div :class="computedClasses" :style="computedStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

<style>
.pxd-grid.debug {
  --grid-line-color: var(--color-amber-400);

  background-image:
    linear-gradient(to right, var(--grid-line-color) 0 1px, transparent 1px 100%),
    linear-gradient(to bottom, var(--grid-line-color) 0 1px, transparent 1px 100%),
    linear-gradient(to right, transparent calc(100% - 1px), var(--grid-line-color) 0),
    linear-gradient(to bottom, transparent calc(100% - 1px), var(--grid-line-color) 0);
  background-size:
    calc(100% / var(--cols-count)) 100%,
    100% calc(100% / var(--rows-count)),
    100% 100%,
    100% 100%;
  background-repeat: repeat, repeat, no-repeat, no-repeat;
  background-origin: padding-box;
}
</style>
