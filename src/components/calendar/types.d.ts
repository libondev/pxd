import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentDateTimeValue } from '../../types/shared/props'

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
  change: [ComponentDateTimeValue, details: ChangeDetails]
  'update:model-value': [ComponentDateTimeValue]
}
