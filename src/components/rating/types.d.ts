import type { ComponentSize } from '../../types/shared'

export interface RatingProps {
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

export interface RatingEmits {
  change: [NonNullable<RatingProps['modelValue']>]
  'update:modelValue': [NonNullable<RatingProps['modelValue']>]
}
