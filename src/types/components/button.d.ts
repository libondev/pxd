import type { ComponentAs, ComponentSizeWithXs, ComponentVariantWithDefault } from '../shared'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ComponentVariantWithDefault | 'ghost' | 'simple' | 'icon'
  size?: ComponentSizeWithXs
  shape?: 'square' | 'rounded'
  align?: 'left' | 'center' | 'right'
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
