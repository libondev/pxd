<script lang="ts" setup>
import type { CountdownEmits, CountdownProps } from './types'
import { computed } from 'vue'
import { useCountdown } from '../../composables/use-countdown.js'
import { dayjs, dayjsDurationPlugin, dayjsMillisecondTokenPlugin } from '../../utils/date.js'

defineOptions({
  name: 'PCountdown',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CountdownProps>(), {
  enabled: false,
  endTime: 0,
  duration: 0,
  autoReset: true,
  millisecond: true,
  format: 'HH:mm:ss',
})

const emits = defineEmits<CountdownEmits>()

dayjs.extend(dayjsDurationPlugin)
dayjs.extend(dayjsMillisecondTokenPlugin)

const { reset, timestamp } = useCountdown({
  inverted: () => props.inverted,
  enabled: () => props.enabled,
  startAt: () => props.startAt ?? 0,
  endTime: () => props.endTime,
  autoReset: () => props.autoReset,
  duration: () => props.duration,
  millisecond: () => props.millisecond,
  intuitive: () => props.intuitive,
  onChange: (enabled) => emits('change', enabled),
  onReset: () => emits('reset'),
  onFinish: () => emits('finish'),
})

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

defineExpose({
  reset,
  times,
})
</script>

<template>
  <div
    data-countdown
    class="pxd-countdown relative w-max max-w-full leading-none tabular-nums text-trim-both"
    v-bind="$attrs"
  >
    <slot :enabled="enabled" :times="times">
      {{ displayTimes }}
    </slot>
  </div>
</template>
