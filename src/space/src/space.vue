<template>
  <div
    :class="className"
    :style="{ '--align': ALIGN_MAP[props.align] }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup name="PxSpace">
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
  'px-space',
  `px-space--${size.value}`,
  `px-flex${props.vertical ? '-col' : ''}`
])
</script>
