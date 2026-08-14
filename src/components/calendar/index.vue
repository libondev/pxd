<script lang="ts" setup>
import type {
  CalendarDateInfo,
  CalendarDay,
  CalendarEmits,
  CalendarPanelInfo,
  CalendarProps,
} from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { dayjs } from '../../utils/date.js'
import { isNil, isUndefined } from '../../utils/is.js'
import PButton from '../button/index.vue'
import PCalendarDay from './calendar-day.vue'

defineOptions({
  name: 'PCalendar',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<CalendarProps>(), {
  defaultValue: null,
  compact: false,
})

const emits = defineEmits<CalendarEmits>()
const configProvider = useConfigProvider()

const today = dayjs()
const todayKey = today.format('YYYY-MM-DD')
const uncontrolledValue = shallowRef<number | null>(props.defaultValue)
const panelDate = shallowRef(dayjs(props.modelValue ?? props.defaultValue ?? today.valueOf()))

const selectedValue = computed(() => {
  return isUndefined(props.modelValue) ? uncontrolledValue.value : props.modelValue
})

const selectedDateKey = computed(() => {
  return isNil(selectedValue.value) ? null : dayjs(selectedValue.value).format('YYYY-MM-DD')
})

const weekDays = computed(() => {
  const days = configProvider.locale.date.day
  return [...days.slice(1), days[0]]
})

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDayOfMonth = panelDate.value.startOf('month')
  const startOffset = (firstDayOfMonth.day() + 6) % 7
  const firstCalendarDay = firstDayOfMonth.subtract(startOffset, 'day')
  const currentMonthKey = panelDate.value.format('YYYY-MM')

  return Array.from({ length: 42 }, (_, index) => {
    const date = firstCalendarDay.add(index, 'day')
    const key = date.format('YYYY-MM-DD')
    const timestamp = date.valueOf()

    return {
      key,
      timestamp,
      year: date.year(),
      month: date.month() + 1,
      date: date.date(),
      isCurrentMonth: key.slice(0, 7) === currentMonthKey,
      isToday: key === todayKey,
      isDisabled: props.isDateDisabled?.(timestamp) ?? false,
    }
  })
})

const panelInfo = computed<CalendarPanelInfo>(() => ({
  year: panelDate.value.year(),
  month: panelDate.value.month() + 1,
}))

function emitPanelChange() {
  emits('panel-change', panelInfo.value)
}

function setPanelDate(date: dayjs.Dayjs) {
  if (date.year() === panelDate.value.year() && date.month() === panelDate.value.month()) {
    return
  }

  panelDate.value = date
  emitPanelChange()
}

function changeMonth(offset: number) {
  setPanelDate(panelDate.value.add(offset, 'month'))
}

function selectDate(day: CalendarDay) {
  if (day.isDisabled) {
    return
  }

  const info: CalendarDateInfo = {
    year: day.year,
    month: day.month,
    date: day.date,
  }

  if (isUndefined(props.modelValue)) {
    uncontrolledValue.value = day.timestamp
  }

  emits('change', day.timestamp, info)
  emits('update:modelValue', day.timestamp, info)
}

function selectToday() {
  setPanelDate(today)

  const todayDate = calendarDays.value.find((day) => day.key === todayKey)

  if (todayDate) {
    selectDate(todayDate)
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (isNil(value)) {
      return
    }

    setPanelDate(dayjs(value))
  },
)
</script>

<template>
  <div class="pxd-calendar w-full max-w-full text-foreground" v-bind="$attrs">
    <div class="gap-1 mb-2 flex items-center">
      <div class="pxd-calendar--date min-w-0 flex-1 truncate" :class="{ 'font-medium': !compact }">
        <slot name="header" v-bind="panelInfo">
          {{ panelInfo.year }} {{ configProvider.locale.date.month[panelInfo.month - 1] }}
        </slot>
      </div>

      <PButton
        icon
        size="sm"
        variant="ghost"
        class="text-foreground-secondary"
        aria-label="Previous month"
        @click="changeMonth(-1)"
      >
        <ChevronRightIcon class="size-4 rotate-180" aria-hidden="true" />
      </PButton>

      <PButton size="sm" @click="selectToday">
        {{ configProvider.locale.date.today }}
      </PButton>

      <PButton
        icon
        size="sm"
        variant="ghost"
        class="text-foreground-secondary"
        aria-label="Next month"
        @click="changeMonth(1)"
      >
        <ChevronRightIcon class="size-4" aria-hidden="true" />
      </PButton>
    </div>

    <div
      class="pxd-calendar--grid grid grid-cols-7"
      :class="compact ? 'gap-1' : 'border-t border-l'"
      role="grid"
    >
      <div
        v-for="weekDay in weekDays"
        :key="weekDay"
        class="pxd-calendar--grid-head text-xs font-medium text-gray-800"
        :class="compact ? 'min-h-6 py-1 text-center' : 'p-2 border-r border-b text-right'"
        role="columnheader"
      >
        {{ weekDay }}
      </div>

      <template v-if="$slots.item">
        <PCalendarDay
          v-for="day in calendarDays"
          :key="day.key"
          :day="day"
          :compact="compact"
          :selected="day.key === selectedDateKey"
          @select="selectDate"
        >
          <template #default="slotProps">
            <slot name="item" v-bind="slotProps" />
          </template>
        </PCalendarDay>
      </template>
      <template v-else>
        <PCalendarDay
          v-for="day in calendarDays"
          :key="day.key"
          :day="day"
          :compact="compact"
          :selected="day.key === selectedDateKey"
          @select="selectDate"
        />
      </template>
    </div>
  </div>
</template>
