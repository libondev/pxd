import type { ComponentAs, ComponentShape, ComponentSizeWithXs, ComponentVariantWithDefault } from '../shared'

export type ButtonVariant = ComponentVariantWithDefault | 'ghost' | 'simple' | 'icon' | 'link'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  align?: 'left' | 'center' | 'right'
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
