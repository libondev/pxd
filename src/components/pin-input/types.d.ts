import type { ComponentSizeWithXs } from '../../types/shared'

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

export interface PinInputEmits {
  change: [NonNullable<PinInputProps['modelValue']>]
  'update:modelValue': [NonNullable<PinInputProps['modelValue']>]
}
