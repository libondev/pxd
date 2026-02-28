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
  prefixIcon?: boolean
  placeholder?: string
  showSeconds?: boolean
  closeOnPressEscape?: boolean
  format?: string
  valueFormat?: string
}

export interface TimePickerEmits {
  change: [boolean]
  select: [MouseEvent]
  'update:modelValue': [string]
}
