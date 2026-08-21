import type { ComponentSizeWithXs, ComponentClass } from '../../types/shared'

export interface InputProps {
  size?: ComponentSizeWithXs
  error?: boolean | string
  min?: number | string
  max?: number | string
  align?: 'left' | 'center' | 'right'
  readonly?: boolean
  disabled?: boolean
  password?: boolean
  autofocus?: boolean
  inputType?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  minlength?: number | string
  maxlength?: number | string
  trimOverflow?: boolean
  clearable?: boolean
  clearValue?: any
  modelValue?: any
  placeholder?: string
  prefixClass?: ComponentClass
  suffixClass?: ComponentClass
  selectOnFocus?: boolean
  showWordLimit?: boolean
  wordLimitPosition?: 'inside' | 'outside'
  clearOnPressEscape?: boolean
  defaultPrefixStyle?: boolean
  defaultSuffixStyle?: boolean
}

export interface InputEmits {
  click: [MouseEvent]
  change: [string, Event]
  focus: [FocusEvent]
  blur: [FocusEvent]
  keydown: [KeyboardEvent]
  'update:modelValue': [string]
  compositionstart: [CompositionEvent]
  compositionupdate: [CompositionEvent]
  compositionend: [CompositionEvent]
}
