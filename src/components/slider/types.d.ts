import type { ComponentSize, ComponentVariant } from '../../types/shared/props'

export interface SliderProps {
  min?: number
  max?: number
  step?: number | number[]
  range?: boolean
  stops?: boolean
  marks?: Record<number, string>
  disabled?: boolean
  size?: ComponentSize
  variant?: ComponentVariant | 'secondary'
  modelValue?: number | number[] | null
  defaultValue?: number | number[] | null
}

export interface SliderEmits {
  change: [NonNullable<SliderProps['modelValue']>]
  'update:modelValue': [NonNullable<SliderProps['modelValue']>]
}
