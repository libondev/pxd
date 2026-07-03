import type { ListOptions, ListOptionSelected } from '../list/types'
import { ButtonVariant } from '../button/types'
import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared'

export interface SplitButtonProps {
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  options?: ListOptions
  disabled?: boolean
  listWidth?: string | number
  modelValue?: ListOptionSelected['value']
  closeOnPressEscape?: boolean
}

export interface SplitButtonEmits {
  change: [ListOptionSelected['value']]
  select: [ListOptionSelected, MouseEvent]
  'update:modelValue': [ListOptionSelected['value']]
}
