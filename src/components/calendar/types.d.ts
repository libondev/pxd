import type { ComponentDateTimeValue } from '../../types/shared'

export interface CalendarDateInfo {
  year: number
  month: number
  date: number
}

export interface CalendarPanelInfo {
  year: number
  month: number
}

export interface CalendarDay {
  key: string
  timestamp: number
  year: number
  month: number
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  isDisabled: boolean
}

export interface CalendarProps {
  compact?: boolean
  modelValue?: ComponentDateTimeValue
  defaultValue?: ComponentDateTimeValue
  valueFormat?: string
  isDateDisabled?: (timestamp: number) => boolean
}

export interface CalendarEmits {
  'panel-change': [info: CalendarPanelInfo]
  change: [ComponentDateTimeValue]
  'update:modelValue': [ComponentDateTimeValue]
}
