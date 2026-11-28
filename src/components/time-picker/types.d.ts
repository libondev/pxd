import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentSize, ComponentDateTimeValue } from '../../types/shared/props'

export type TimePickerChangeReason = Extract<
  ChangeReason,
  'api' | 'cleared' | 'item-press' | 'outside-press' | 'trigger-press' | 'typed'
>

export interface DateTimePreset<T = Date> {
  label: string
  getDate: () => T
}

export interface TimePickerProps {
  size?: ComponentSize
  id?: string
  invalid?: boolean
  presets?: DateTimePreset[]
  disabled?: boolean
  clearable?: boolean
  modelValue?: ComponentDateTimeValue
  suffixIcon?: boolean
  placeholder?: string
  showSeconds?: boolean
  labelFormat?: string
  valueFormat?: string
}

export interface TimePickerEmits {
  change: [ComponentDateTimeValue, details: ChangeDetails<TimePickerChangeReason>]
  'update:model-value': [ComponentDateTimeValue]
}
