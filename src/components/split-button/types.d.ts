import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared/props'
import type { ListModelValue, ListOptions } from '../list/types'
import { ButtonVariant, type ButtonProps } from '../button/types'

export interface SplitButtonProps {
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  options?: ListOptions
  disabled?: boolean
  modelValue?: ListModelValue
  mainButtonProps?: ButtonProps
  closeOnPressEscape?: boolean
}

export interface SplitButtonEmits {
  change: [ListModelValue]
  'main-click': [ListModelValue]
  'update:model-value': [ListModelValue]
}
