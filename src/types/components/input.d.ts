import type { HTMLAttributes } from 'vue'
import type { ComponentLabel, ComponentSizeWithXs } from '../shared/props'

export interface InputProps {
  size?: ComponentSizeWithXs
  error?: boolean | string
  min?: number | string
  max?: number | string
  align?: 'left' | 'center' | 'right'
  label?: ComponentLabel
  readonly?: boolean
  disabled?: boolean
  password?: boolean
  required?: boolean
  autofocus?: boolean
  inputType?: HTMLInputElement['type']
  inputmode?: HTMLAttributes['inputmode']
  minlength?: number | string
  maxlength?: number | string
  modelValue?: ComponentLabel
  allowClear?: boolean
  placeholder?: string
  prefixStyle?: boolean
  suffixStyle?: boolean
  parser?: (value?: any) => any
  formatter?: (value?: any) => any
}
