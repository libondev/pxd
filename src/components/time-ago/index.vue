<script lang="ts" setup>
import type { TimeAgoProps } from './types'
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
} from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { dayjs } from '../../utils/date.js'
import { cachedOn, cachedOff } from '../../utils/event.js'

defineOptions({
  name: 'PTimeAgo',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TimeAgoProps>(), {
  refresh: true,
})

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

const BUCKETS = [
  { unit: 'now', size: MINUTE, limit: MINUTE },
  { unit: 'minute', size: MINUTE, limit: HOUR },
  { unit: 'hour', size: HOUR, limit: DAY },
  { unit: 'day', size: DAY, limit: MONTH },
  { unit: 'month', size: MONTH, limit: YEAR },
  { unit: 'year', size: YEAR, limit: Infinity },
] as const
let refreshTimer: ReturnType<typeof setTimeout> | undefined

const timestamp = computed(() => dayjs(props.value).valueOf())

const now = shallowRef(Date.now())
const dateTime = computed(() =>
  Number.isFinite(timestamp.value) ? dayjs(timestamp.value).toISOString() : undefined,
)

const configProvider = useConfigProvider()

const text = computed(() => {
  const locale = configProvider.locale.timeAgo

  if (!Number.isFinite(timestamp.value)) {
    return locale.invalid
  }

  const diff = now.value - timestamp.value
  const { bucket, value } = resolveBucket(Math.abs(diff))

  if (bucket.unit === 'now') {
    return locale.now
  }

  const labels = locale.unit[bucket.unit]
  const unit = value === 1 ? labels.one : labels.other

  return (diff >= 0 ? locale.past : locale.future)
    .replace('{value}', String(value))
    .replace('{unit}', unit)
})

function resolveBucket(age: number) {
  const bucket = BUCKETS.find((item) => age < item.limit) ?? BUCKETS[BUCKETS.length - 1]

  return { bucket, value: Math.floor(age / bucket.size) }
}

function getNextDelay() {
  const age = Math.abs(now.value - timestamp.value)
  const { bucket, value } = resolveBucket(age)

  return Math.min((value + 1) * bucket.size, bucket.limit) - age
}
function stopTimer() {
  clearTimeout(refreshTimer)
}

function startTimer() {
  stopTimer()

  if (!props.refresh) {
    return
  }

  const delay = getNextDelay()

  if (!Number.isFinite(delay) || delay > DAY) {
    return
  }

  refreshTimer = setTimeout(syncNow, delay)
}

function syncNow() {
  if (!props.refresh) {
    return
  }

  now.value = Date.now()
  startTimer()
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    syncNow()
  }
}

watch(() => [timestamp.value, props.refresh], startTimer)

onActivated(syncNow)

onDeactivated(stopTimer)

onMounted(() => {
  startTimer()
  cachedOn(document, 'visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopTimer()
  cachedOff(document, 'visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <time
    class="pxd-time-ago"
    data-time-ago
    data-allow-mismatch="text"
    :datetime="dateTime"
    v-bind="$attrs"
  >
    {{ text }}
  </time>
</template>
