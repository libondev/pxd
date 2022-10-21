<template>
  <div
    :class="className"
    :style="{ '--align': ALIGN_MAP[props.align] }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup name="CSpace">
import { spaceProps } from './constraints'
import { useSize } from '../../_hooks'

const props = defineProps(spaceProps)

const ALIGN_MAP = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline'
}

const size = useSize(props)
const className = computed(() => [
  'c-space',
  `c-space--${size.value}`,
  `carbons-flex${props.vertical ? '-col' : ''}`
])
</script>
