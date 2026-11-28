import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentDateTimeValue, ComponentSize } from '../../types/shared/props'

export type DatePickerChangeReason = Extract<
  ChangeReason,
  'api' | 'cleared' | 'item-press' | 'typed'
>

export interface DatePickerProps {
  size?: ComponentSize
  id?: string
  invalid?: boolean
  disabled?: boolean
  clearable?: boolean
  modelValue?: ComponentDateTimeValue
  suffixIcon?: boolean
  placeholder?: string
  labelFormat?: string
  valueFormat?: string
  isDateDisabled?: (timestamp: number) => boolean
}

export interface DatePickerEmits {
  change: [ComponentDateTimeValue, details: ChangeDetails<DatePickerChangeReason>]
  'update:model-value': [ComponentDateTimeValue]
}
