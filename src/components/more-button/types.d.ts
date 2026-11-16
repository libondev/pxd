import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText } from '../../types/shared/props'

export interface MoreButtonProps {
  moreText?: ComponentText
  lessText?: ComponentText
  modelValue?: boolean
}

export interface MoreButtonEmits {
  change: [NonNullable<MoreButtonProps['modelValue']>, details?: ChangeDetails]
  'update:model-value': [NonNullable<MoreButtonProps['modelValue']>]
}
