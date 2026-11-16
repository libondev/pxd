import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentSizeWithXs } from '../../types/shared/props'

export interface PinInputProps {
  size?: ComponentSizeWithXs
  error?: boolean | string
  length?: number
  readonly?: boolean
  disabled?: boolean
  modelValue?: string
  placeholder?: string
  type?:
    | 'numeric'
    | 'alphabetic'
    | 'alphanumeric'
    | 'numeric-password'
    | 'alphabetic-password'
    | 'alphanumeric-password'
}

export type PinInputChangeValue = string

export interface PinInputEmits {
  change: [PinInputChangeValue, details: ChangeDetails]
  'update:model-value': [PinInputChangeValue]
}
