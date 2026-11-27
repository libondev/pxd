import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentSizeWithXs } from '../../types/shared/props'

export type PinInputMode =
  | 'numeric'
  | 'alphabetic'
  | 'alphanumeric'
  | 'numeric-password'
  | 'alphabetic-password'
  | 'alphanumeric-password'

export interface PinInputProps {
  size?: ComponentSizeWithXs
  id?: string
  invalid?: boolean
  length?: number
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  modelValue?: string
  placeholder?: string
  mode?: PinInputMode
}

export type PinInputChangeValue = string

export interface PinInputEmits {
  change: [PinInputChangeValue, details: ChangeDetails]
  'update:model-value': [PinInputChangeValue]
}
