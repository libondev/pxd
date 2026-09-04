import type { ComponentDateTimeValue, ComponentSize } from '../../types/shared'

export interface DatePickerProps {
  size?: ComponentSize
  error?: boolean | string
  disabled?: boolean
  clearable?: boolean
  modelValue?: ComponentDateTimeValue
  suffixIcon?: boolean
  placeholder?: string
  labelFormat?: string
  valueFormat?: string
  isDateDisabled?: (timestamp: number) => boolean
  closeOnPressEscape?: boolean
}

export interface DatePickerEmits {
  change: [ComponentDateTimeValue]
  'update:modelValue': [ComponentDateTimeValue]
}
