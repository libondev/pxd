import type {
  ComponentAs,
  ComponentAlign,
  ComponentShape,
  ComponentSizeWithXs,
  ComponentVariantWithDefault,
} from '../../types/shared/props'

export type ButtonVariant = ComponentVariantWithDefault | 'ghost' | 'simple' | 'link'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ButtonVariant
  size?: ComponentSizeWithXs
  shape?: ComponentShape
  align?: ComponentAlign
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
