import type { ComponentSize, ComponentVariant } from '../../types/shared'

export interface SliderProps {
  min?: number
  max?: number
  step?: number
  range?: boolean
  disabled?: boolean
  size?: ComponentSize
  variant?: ComponentVariant | 'secondary'
  modelValue?: number | [number, number] | null
}

export interface SliderEmits {
  change: [NonNullable<SliderProps['modelValue']>]
  'update:modelValue': [NonNullable<SliderProps['modelValue']>]
}
