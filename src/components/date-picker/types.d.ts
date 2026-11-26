import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentDateTimeValue, ComponentSize } from '../../types/shared/props'

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
  change: [ComponentDateTimeValue, details: ChangeDetails]
  'update:model-value': [ComponentDateTimeValue]
}
