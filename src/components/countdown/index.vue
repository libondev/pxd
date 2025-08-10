<script lang="ts" setup>
import type { Options } from '../../composables/use-countdown'
import dayjs from 'dayjs'
import dayjsDuration from 'dayjs/plugin/duration'
import { computed } from 'vue'
import { useCountdown } from '../../composables/use-countdown'
import millisecondTokenPlugin from '../../utils/dayjs-millisecond-token'

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
    format: 'HH:mm:ss',
  },
)

const emits = defineEmits<{
  change: [active: boolean]
  reset: []
  finish: []
}>()

dayjs.extend(dayjsDuration)
dayjs.extend(millisecondTokenPlugin)

const {
  reset,
  timestamp,
} = useCountdown<typeof emits>(props, emits)

const times = computed(() => {
  const t = dayjs.duration(timestamp.value)

  return {
    dd: t.format('DD'),
    hh: t.format('HH'),
    mm: t.format('mm'),
    ss: t.format('ss'),
    ms: t.format('SSS'),
  }
})

const displayTimes = computed(() => {
  const time = dayjs
    .duration(timestamp.value)
    .format(props.format)

  return time
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
