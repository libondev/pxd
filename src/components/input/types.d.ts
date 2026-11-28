import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentSizeWithXs, ComponentClass } from '../../types/shared/props'

export type InputChangeReason = Extract<ChangeReason, 'api' | 'cleared' | 'typed'>

export interface InputProps {
  size?: ComponentSizeWithXs
  id?: string
  invalid?: boolean
  min?: number | string
  max?: number | string
  align?: 'left' | 'center' | 'right'
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  password?: boolean
  autofocus?: boolean
  type?: string
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  inputAttrs?: Record<string, string | number | boolean | undefined>
  minLength?: number | string
  maxLength?: number | string
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
  change: [string, details: ChangeDetails<InputChangeReason>]
  focus: [FocusEvent]
  blur: [FocusEvent]
  keydown: [KeyboardEvent]
  'update:model-value': [string]
  compositionstart: [CompositionEvent]
  compositionupdate: [CompositionEvent]
  compositionend: [CompositionEvent]
}
