import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentText } from '../../types/shared/props'

export type MoreButtonChangeReason = Extract<ChangeReason, 'api' | 'trigger-press'>

export interface MoreButtonProps {
  moreText?: ComponentText
  lessText?: ComponentText
  modelValue?: boolean
}

export type MoreButtonChangeValue = boolean

export interface MoreButtonEmits {
  change: [MoreButtonChangeValue, details: ChangeDetails<MoreButtonChangeReason>]
  'update:model-value': [MoreButtonChangeValue]
}
