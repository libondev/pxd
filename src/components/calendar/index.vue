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
import { useConfigProvider } from '../../contexts/config-provider'
import { dayjs } from '../../utils/date'
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
})

const emits = defineEmits<CalendarEmits>()
const configProvider = useConfigProvider()

const today = dayjs()
const todayKey = today.format('YYYY-MM-DD')
const uncontrolledValue = shallowRef<number | null>(props.defaultValue)
const panelDate = shallowRef(dayjs(props.modelValue ?? props.defaultValue ?? today.valueOf()))

const selectedValue = computed(() => {
  return props.modelValue === undefined ? uncontrolledValue.value : props.modelValue
})

const selectedDateKey = computed(() => {
  return selectedValue.value === null || selectedValue.value === undefined
    ? null
    : dayjs(selectedValue.value).format('YYYY-MM-DD')
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

  if (props.modelValue === undefined) {
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
    if (value !== undefined && value !== null) {
      setPanelDate(dayjs(value))
    }
  },
)
</script>

<template>
  <div class="pxd-calendar w-full max-w-full text-foreground" v-bind="$attrs">
    <div class="mb-4 gap-2 flex items-center justify-between">
      <div class="min-w-0 font-medium flex-1 truncate">
        <slot name="header" v-bind="panelInfo">
          {{ panelInfo.year }} {{ configProvider.locale.date.month[panelInfo.month - 1] }}
        </slot>
      </div>

      <div class="gap-1 flex shrink-0 items-center">
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

        <PButton size="sm" variant="ghost" @click="selectToday">
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
    </div>

    <div class="grid grid-cols-7 border-t border-l" role="grid">
      <div
        v-for="weekDay in weekDays"
        :key="weekDay"
        class="min-h-8 p-2 font-medium text-xs border-r border-b text-right text-foreground-secondary"
        role="columnheader"
      >
        {{ weekDay }}
      </div>

      <PCalendarDay
        v-for="day in calendarDays"
        :key="day.key"
        :day="day"
        :selected="day.key === selectedDateKey"
        @select="selectDate"
      >
        <template v-if="$slots.default" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </PCalendarDay>
    </div>
  </div>
</template>
