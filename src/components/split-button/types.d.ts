import type { ButtonVariant } from '../../types/components/button'
import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared/props'
import type { ButtonProps } from '../button/types'
import type { ListModelValue, ListOptions } from '../list/types'

export type SplitButtonChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface SplitButtonProps {
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  options?: ListOptions
  disabled?: boolean
  modelValue?: ListModelValue
  mainButtonProps?: ButtonProps
}

export interface SplitButtonEmits {
  change: [ListModelValue, details: ChangeDetails<SplitButtonChangeReason>]
  'main-click': []
  'update:model-value': [ListModelValue]
}
