<script lang="ts" setup>
import type { ComponentDateTimeValue } from '../../types/shared'
import type { DatePickerEmits, DatePickerProps } from './types'
import CalendarIcon from '@gdsicon/vue/calendar'
import { computed, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { dayjs } from '../../utils/date.js'
import { isNil } from '../../utils/is.js'
import PCalendar from '../calendar/index.vue'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PDatePicker',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const DATE_FORMAT_TOKEN_RE = /(YYYY|YY|MM|DD|M|D)/
const YEAR_FORMAT_TOKEN_RE = /YYYY|YY/

const props = withDefaults(defineProps<DatePickerProps>(), {
  suffixIcon: true,
  closeOnPressEscape: true,
  labelFormat: 'YYYY-MM-DD',
  valueFormat: 'YYYY-MM-DD',
})

const emits = defineEmits<DatePickerEmits>()
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const popoverVisible = shallowRef(false)
const draftInput = shallowRef<string | null>(null)
const dayjsDateTime = shallowRef<dayjs.Dayjs | null>(null)

const calendarModelValue = computed(() => dayjsDateTime.value?.valueOf() ?? null)

const modelValue = useModelValue(props, emits, {
  get() {
    if (draftInput.value !== null) {
      return draftInput.value
    }

    return dayjsDateTime.value ? dayjsDateTime.value.format(props.labelFormat) : ''
  },
})

function togglePopoverVisible(visible: boolean) {
  popoverVisible.value = visible
}

function formatEmittedValue(date: dayjs.Dayjs): ComponentDateTimeValue {
  if (props.valueFormat === 'timestamp') {
    return date.valueOf()
  }

  return date.format(props.valueFormat)
}

function isSameCommittedDate(date: dayjs.Dayjs | null) {
  if (date === null || dayjsDateTime.value === null) {
    return date === dayjsDateTime.value
  }

  return date.isSame(dayjsDateTime.value, 'day')
}

function commitDate(date: dayjs.Dayjs | null) {
  const shouldEmit = !isSameCommittedDate(date)

  dayjsDateTime.value = date
  draftInput.value = null

  if (!shouldEmit) {
    return
  }

  modelValue.value = date ? formatEmittedValue(date) : null
}

function parseIncomingValue(value: DatePickerProps['modelValue']): dayjs.Dayjs | null {
  if (isNil(value) || value === '') {
    return null
  }

  if (typeof value === 'number' || value instanceof Date) {
    const date = dayjs(value)
    return date.isValid() ? date : null
  }

  if (props.valueFormat === 'timestamp') {
    const date = dayjs(Number(value))
    return date.isValid() ? date : null
  }

  return parseDateString(value, props.valueFormat) ?? parseDateString(value, props.labelFormat)
}

function parseDateString(input: string, format: string): dayjs.Dayjs | null {
  const restInput = input.trim()
  if (!restInput) {
    return null
  }

  const tokens = format.split(DATE_FORMAT_TOKEN_RE).filter(Boolean)
  const parsed: { year?: number; month?: number; date?: number } = {}
  let rest = restInput

  for (const token of tokens) {
    if (!rest) {
      break
    }

    if (!DATE_FORMAT_TOKEN_RE.test(token)) {
      if (rest.startsWith(token)) {
        rest = rest.slice(token.length)
        continue
      }

      break
    }

    const matched = consumeDateToken(token, rest)
    if (!matched) {
      break
    }

    if (token === 'YYYY' || token === 'YY') {
      parsed.year = matched.value
    } else if (token === 'MM' || token === 'M') {
      parsed.month = matched.value
    } else {
      parsed.date = matched.value
    }

    rest = rest.slice(matched.length)
  }

  if (rest) {
    return null
  }

  if (YEAR_FORMAT_TOKEN_RE.test(format) && parsed.year == null) {
    return null
  }

  if (parsed.year == null && parsed.month == null && parsed.date == null) {
    return null
  }

  const year = parsed.year ?? dayjs().year()
  const month = parsed.month ?? 1
  const date = parsed.date ?? 1
  const result = dayjs(new Date(year, month - 1, date))

  if (result.year() !== year || result.month() !== month - 1 || result.date() !== date) {
    return null
  }

  return result
}

function consumeDateToken(token: string, input: string): { value: number; length: number } | null {
  if (token === 'YYYY') {
    const match = input.match(/^\d{4}/)
    return match ? { value: Number(match[0]), length: match[0].length } : null
  }

  if (token === 'YY') {
    const match = input.match(/^\d{2}/)
    if (!match) {
      return null
    }

    const year = Number(match[0])
    return { value: year + (year > 68 ? 1900 : 2000), length: match[0].length }
  }

  if (token === 'MM' || token === 'M' || token === 'DD' || token === 'D') {
    const match = input.match(/^\d{1,2}/)
    return match ? { value: Number(match[0]), length: match[0].length } : null
  }

  return null
}

function tryCommitInput(value: string): boolean {
  if (value === '') {
    commitDate(null)
    return true
  }

  const parsed = parseDateString(value, props.labelFormat)
  if (!parsed) {
    return false
  }

  commitDate(parsed)
  return true
}

function onDraftInput(value: string) {
  draftInput.value = value
}

function onInputValueChange(value: string) {
  if (tryCommitInput(value)) {
    togglePopoverVisible(false)
  }
}

function onCalendarChange(value: ComponentDateTimeValue) {
  const date = dayjs(value as number)
  if (!date.isValid()) {
    return
  }

  commitDate(date)
  togglePopoverVisible(false)
}

function onOutsideClick() {
  if (draftInput.value === null) {
    return
  }

  if (!tryCommitInput(draftInput.value)) {
    draftInput.value = null
  }
}

function updateDayjsDateTime(value: DatePickerProps['modelValue']) {
  dayjsDateTime.value = parseIncomingValue(value)
}

watch(() => props.modelValue, updateDayjsDateTime, { immediate: true })
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    class="pxd-date-picker w-full"
    trigger="click"
    :disabled="disabled"
    :class="$attrs.class"
    :style="$attrs.style"
    :adaptive="isAdaptive"
    :toggle-on-trigger="false"
    :fill-trigger-width="false"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    @outside-click="onOutsideClick"
  >
    <PInput
      :size="size"
      :error="error"
      :disabled="disabled"
      :readonly="isAdaptive"
      :clearable="clearable"
      :model-value="modelValue"
      :placeholder="placeholder"
      :default-suffix-style="false"
      :data-focusing="popoverVisible"
      :select-on-focus="!isAdaptive"
      v-bind="$attrs"
      @update:model-value="onDraftInput"
      @clear="onInputValueChange"
      @change="onInputValueChange"
    >
      <template v-if="suffixIcon" #suffix>
        <CalendarIcon class="me-3" />
      </template>
    </PInput>

    <template #content>
      <PCalendar
        class="p-2"
        compact
        :value-format="valueFormat"
        :model-value="calendarModelValue"
        :is-date-disabled="isDateDisabled"
        @change="onCalendarChange"
      />
    </template>
  </PPopover>
</template>
