import type { ComponentSize, ComponentDateTimeValue } from '../../types/shared'

export interface DateTimePreset<T = Date> {
  label: string
  getDate: () => T
}

export interface TimePickerProps {
  size?: ComponentSize
  error?: boolean | string
  presets?: DateTimePreset[]
  disabled?: boolean
  clearable?: boolean
  modelValue?: ComponentDateTimeValue
  suffixIcon?: boolean
  placeholder?: string
  showSeconds?: boolean
  labelFormat?: string
  valueFormat?: string
  closeOnPressEscape?: boolean
}

export interface TimePickerEmits {
  change: [ComponentDateTimeValue]
  'update:modelValue': [ComponentDateTimeValue]
}
