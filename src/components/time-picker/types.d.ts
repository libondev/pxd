import type { ComponentSize } from '../../types/shared'

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
  modelValue?: Date | string | number | null
  suffixIcon?: boolean
  placeholder?: string
  showSeconds?: boolean
  closeOnPressEscape?: boolean
  format?: string
  valueFormat?: string
}

export interface TimePickerEmits {
  change: [string]
  'update:modelValue': [string]
}
