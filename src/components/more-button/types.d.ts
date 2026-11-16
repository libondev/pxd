import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText } from '../../types/shared/props'

export interface MoreButtonProps {
  moreText?: ComponentText
  lessText?: ComponentText
  modelValue?: boolean
}

export type MoreButtonChangeValue = boolean

export interface MoreButtonEmits {
  change: [MoreButtonChangeValue, details: ChangeDetails]
  'update:model-value': [MoreButtonChangeValue]
}
