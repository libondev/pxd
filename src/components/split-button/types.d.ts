import type { ButtonVariant } from '../../types/components/button'
import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentShape, ComponentSizeWithXs } from '../../types/shared/props'
import type { ButtonProps } from '../button/types'
import type { ListModelValue, ListOptions } from '../list/types'

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
  change: [ListModelValue, details: ChangeDetails]
  'main-click': []
  'update:model-value': [ListModelValue]
}
