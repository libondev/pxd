<script lang="ts" setup>
import type { CountdownEmits, CountdownProps } from './types'
import { computed, onBeforeUnmount } from 'vue'
import { useCountdown } from '../../composables/use-countdown'
import { dayjs, dayjsDurationPlugin, dayjsMillisecondTokenPlugin } from '../../utils/date'

defineOptions({
  name: 'PCountDown',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CountdownProps>(), {
  active: false,
  endTime: 0,
  durations: 0,
  precision: 0,
  autoReset: true,
  millisecond: true,
  format: 'HH:mm:ss',
})

const emits = defineEmits<CountdownEmits>()

dayjs.extend(dayjsDurationPlugin)
dayjs.extend(dayjsMillisecondTokenPlugin)

const { stop, reset, timestamp } = useCountdown<typeof emits>(props, emits)

const timestampDuration = computed(() => {
  return dayjs.duration(timestamp.value)
})

const times = computed(() => {
  const t = timestampDuration.value

  return {
    dd: t.format('DD'),
    hh: t.format('HH'),
    mm: t.format('mm'),
    ss: t.format('ss'),
    ms: t.format('SSS'),
  }
})

const displayTimes = computed(() => {
  const time = timestampDuration.value.format(props.format)

  return time
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({
  reset,
  times,
})
</script>

<template>
  <div
    class="pxd-countdown relative w-max max-w-full leading-none tabular-nums text-trim-both"
    v-bind="$attrs"
  >
    <slot :active="active" :times="times">
      {{ displayTimes }}
    </slot>
  </div>
</template>
