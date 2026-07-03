import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'

export interface TextareaProps {
  rows?: string | number
  cols?: string | number
  size?: ComponentSizeWithXs
  error?: boolean | string
  readonly?: boolean
  disabled?: boolean
  autofocus?: boolean
  minlength?: number | string
  maxlength?: number | string
  modelValue?: ComponentLabel
  placeholder?: string
  showWordLimit?: boolean | string
  wordLimitPosition?: 'inside' | 'outside'
}

export interface TextareaEmits {
  'update:modelValue': [NonNullable<TextareaProps['modelValue']>]
  change: [NonNullable<TextareaProps['modelValue']>]
  focus: [FocusEvent]
  blur: [FocusEvent]
}
