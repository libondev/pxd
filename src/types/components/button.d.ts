import type { ComponentAs, ComponentSizeWithXs, ComponentVariantWithDefault } from './shared'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ComponentVariantWithDefault | 'ghost' | 'simple'
  size?: ComponentSizeWithXs
  shape?: 'square' | 'rounded'
  align?: 'left' | 'center' | 'right'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}
