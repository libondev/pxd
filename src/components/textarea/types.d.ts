import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentSizeWithXs } from '../../types/shared/props'

export interface TextareaProps {
  rows?: string | number
  cols?: string | number
  size?: ComponentSizeWithXs
  error?: boolean | string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  autofocus?: boolean
  minLength?: number | string
  maxLength?: number | string
  trimOverflow?: boolean
  modelValue?: ComponentText
  placeholder?: string
  showWordLimit?: boolean | string
  wordLimitPosition?: 'inside' | 'outside'
}

export type TextareaChangeValue = string | number

export interface TextareaEmits {
  'update:model-value': [TextareaChangeValue]
  change: [TextareaChangeValue, details: ChangeDetails]
  focus: [FocusEvent]
  blur: [FocusEvent]
}
