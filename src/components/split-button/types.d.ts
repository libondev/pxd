import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared'
import type { ListOptions, ListOptionSelected } from '../list/types'
import { ButtonVariant } from '../button/types'

export interface SplitButtonProps {
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  options?: ListOptions
  disabled?: boolean
  modelValue?: ListOptionSelected['value']
  closeOnPressEscape?: boolean
}

export interface SplitButtonEmits {
  change: [ListOptionSelected['value']]
  'update:modelValue': [ListOptionSelected['value']]
}
