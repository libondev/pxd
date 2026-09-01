import type { ComponentSize, ComponentShape } from '../../types/shared'
import type { ButtonVariant } from '../button/types'
import type { ListModelValue, ListOption, ListOptions } from '../list/types'

export interface SelectProps {
  modelValue?: ListModelValue
  variant?: ButtonVariant
  size?: ComponentSize
  shape?: ComponentShape
  error?: boolean | string
  options?: ListOptions
  disabled?: boolean
  multiple?: boolean
  placeholder?: string
  labelFormat?: (items: ListOptions) => string
  closeOnPressEscape?: boolean
}

export interface SelectEmits {
  change: [ListModelValue]
  'update:modelValue': [ListModelValue]
}
