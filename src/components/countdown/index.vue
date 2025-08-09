<script lang="ts" setup>
import type { Options } from '../../composables/use-countdown'
import { computed } from 'vue'
import { useCountdown } from '../../composables/use-countdown'

interface Props extends Options {
  format?: string
}

defineOptions({
  name: 'PCountDown',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    active: false,
    endTime: 0,
    durations: 0,
    precision: 0,
    autoReset: true,
    millisecond: true,
    format: 'hh:mm:ss.ms',
  },
)

const emits = defineEmits<{
  change: [active: boolean]
  reset: []
  finish: []
}>()

const {
  reset,
  times,
} = useCountdown<typeof emits>(props, emits)

const displayTimes = computed(() => {
  const { format, precision } = props
  let result = format

  result = result.replace(/\.ms/, precision ? `.${times.value.ms}` : '')

  return result
    .replace(/dd/, times.value.dd)
    .replace(/hh/, times.value.hh)
    .replace(/mm/, times.value.mm)
    .replace(/ss/, times.value.ss)
})

defineExpose({
  reset,
  times,
})
</script>

<template>
  <div class="pxd-countdown flex items-center justify-center leading-none tabular-nums">
    <slot :times="times">
      {{ displayTimes }}
    </slot>
  </div>
</template>
