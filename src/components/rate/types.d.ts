import type { ComponentSize } from '../../types/shared'

export interface RateProps {
  modelValue?: number
  count?: number
  size?: ComponentSize
  color?: string
  voidColor?: string
  allowHalf?: boolean
  readonly?: boolean
  disabled?: boolean
  clearable?: boolean
}

export interface RateEmits {
  change: [NonNullable<RateProps['modelValue']>]
  'update:modelValue': [NonNullable<RateProps['modelValue']>]
}
