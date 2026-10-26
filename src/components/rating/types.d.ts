import type { ComponentSizeWithXs } from '../../types/shared/props'

export interface RatingProps {
  modelValue?: number
  count?: number
  size?: ComponentSizeWithXs
  color?: string
  voidColor?: string
  allowHalf?: boolean
  readonly?: boolean
  disabled?: boolean
  clearable?: boolean
}

export interface RatingEmits {
  change: [NonNullable<RatingProps['modelValue']>]
  'update:model-value': [NonNullable<RatingProps['modelValue']>]
}
