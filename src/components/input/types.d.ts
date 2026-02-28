import type { HTMLAttributes } from 'vue'

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
  inputType?: HTMLInputElement['type']
  inputmode?: HTMLAttributes['inputmode']
  minlength?: number | string
  maxlength?: number | string
  clearable?: boolean
  clearValue?: string | number | null | undefined
  modelValue?: string | number | null | undefined
  placeholder?: string
  prefixClass?: ComponentClass
  suffixClass?: ComponentClass
  selectOnFocus?: boolean
  defaultPrefixStyle?: boolean
  defaultSuffixStyle?: boolean
}

export interface InputEmits {
  click: [MouseEvent]
  input: [string]
  change: [string, Event]
  focus: [FocusEvent]
  blur: [FocusEvent]
  keydown: [KeyboardEvent]
  'update:modelValue': [string]
  compositionstart: [CompositionEvent]
  compositionupdate: [CompositionEvent]
  compositionend: [CompositionEvent]
}
