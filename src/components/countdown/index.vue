<script lang="ts" setup>
import type { Options } from '../../composables/use-countdown'
import { computed, onBeforeUnmount } from 'vue'
import { useCountdown } from '../../composables/use-countdown'
import { dayjs, dayjsDurationPlugin, dayjsMillisecondTokenPlugin } from '../../utils/date'

interface Props extends Options {
  format?: string
}

defineOptions({
  name: 'PCountDown',
})

const props = withDefaults(defineProps<Props>(), {
  active: false,
  endTime: 0,
  durations: 0,
  precision: 0,
  autoReset: true,
  millisecond: true,
  format: 'HH:mm:ss',
})

const emits = defineEmits<{
  change: [active: boolean]
  reset: []
  finish: []
}>()

dayjs.extend(dayjsDurationPlugin)
dayjs.extend(dayjsMillisecondTokenPlugin)

const { stop, reset, timestamp } = useCountdown<typeof emits>(props, emits)

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
  const time = dayjs.duration(timestamp.value).format(props.format)

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
  <div class="pxd-countdown relative w-max max-w-full leading-none tabular-nums">
    <slot :active="active" :times="times">
      {{ displayTimes }}
    </slot>
  </div>
</template>
