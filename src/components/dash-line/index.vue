<script lang="ts" setup>
import type { BasePosition } from '../../types/shared'
import type { DashLineProps } from './types'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PDashLine',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DashLineProps>(), {
  position: () => ['top'],
})

const positions = computed<BasePosition[]>(() =>
  Array.isArray(props.position) ? props.position : [props.position],
)

const strokeColor = computed(() => props.color ?? 'var(--color-gray-600)')
const strokeWidth = computed(() => getCssUnitValue(props.lineSize, '1px'))
const dashArray = computed(() => {
  const dash = parseFloat(getCssUnitValue(props.dashSize) ?? '8')
  const gap = parseFloat(getCssUnitValue(props.gap) ?? '8')
  return `${dash},${gap}`
})

interface LineConfig {
  x1: string
  y1: string
  x2: string
  y2: string
}

const lineMap: Record<BasePosition, LineConfig> = {
  top: { x1: '0', y1: '0', x2: '100%', y2: '0' },
  bottom: { x1: '0', y1: '100%', x2: '100%', y2: '100%' },
  left: { x1: '0', y1: '0', x2: '0', y2: '100%' },
  right: { x1: '100%', y1: '0', x2: '100%', y2: '100%' },
}

const lines = computed(() => positions.value.map((pos) => lineMap[pos]))
</script>

<template>
  <div class="pxd-dash-line relative max-w-full min-w-full" v-bind="$attrs">
    <svg
      class="inset-0 pointer-events-none absolute size-full overflow-visible"
      preserveAspectRatio="none"
    >
      <line
        v-for="(line, index) in lines"
        :key="index"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="dashArray"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>
