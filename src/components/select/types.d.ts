import type { ComponentSize, ComponentShape } from '../../types/shared'
import type { ButtonVariant } from '../button/types'
import type { ListModelValue, ListOption, ListOptions } from '../list/types'

export interface SelectProps {
  size?: ComponentSize
  shape?: ComponentShape
  error?: boolean | string
  variant?: ButtonVariant
  options?: ListOptions
  virtual?: boolean
  disabled?: boolean
  multiple?: boolean
  modelValue?: ListModelValue
  suffixIcon?: boolean
  placeholder?: string
  labelFormat?: (items: ListOptions) => string
  closeOnPressEscape?: boolean
}

export interface SelectEmits {
  change: [ListModelValue]
  'update:modelValue': [ListModelValue]
}
