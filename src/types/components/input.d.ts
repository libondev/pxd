import type { HTMLAttributes } from 'vue'
import type { ComponentSizeWithXs } from '../shared/props'

export interface InputProps {
  size?: ComponentSizeWithXs
  error?: boolean | string
  min?: number | string
  max?: number | string
  align?: 'left' | 'center' | 'right'
  readonly?: boolean
  disabled?: boolean
  password?: boolean
  required?: boolean
  autofocus?: boolean
  inputType?: HTMLInputElement['type']
  inputmode?: HTMLAttributes['inputmode']
  minlength?: number | string
  maxlength?: number | string
  clearable?: boolean
  clearValue?: string | number | null | undefined
  modelValue?: string | number | null | undefined
  placeholder?: string
  prefixStyle?: boolean
  suffixStyle?: boolean
  prefixClass?: ComponentClass
  suffixClass?: ComponentClass
  selectOnFocus?: boolean
}
