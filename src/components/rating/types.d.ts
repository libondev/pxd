import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentSizeWithXs } from '../../types/shared/props'

export type RatingChangeReason = Extract<ChangeReason, 'api' | 'settle' | 'step'>

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

export type RatingChangeValue = number

export interface RatingEmits {
  change: [RatingChangeValue, details: ChangeDetails<RatingChangeReason>]
  'update:model-value': [RatingChangeValue]
}
