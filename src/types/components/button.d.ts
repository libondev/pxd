import type { ComponentAs, ComponentSizeWithXs, ComponentVariantWithDefault } from '../shared'

export type ButtonVariant = ComponentVariantWithDefault | 'ghost' | 'simple' | 'icon' | 'link'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: 'square' | 'rounded'
  align?: 'left' | 'center' | 'right'
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
