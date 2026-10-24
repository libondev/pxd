import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared/props'
import type { ListModelValue, ListOptions } from '../list/types'
import { ButtonVariant } from '../button/types'

export interface SplitButtonProps {
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  options?: ListOptions
  disabled?: boolean
  modelValue?: ListModelValue
  closeOnPressEscape?: boolean
}

export interface SplitButtonEmits {
  change: [ListModelValue]
  'update:model-value': [ListModelValue]
}
