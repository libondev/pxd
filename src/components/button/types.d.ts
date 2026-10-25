import type {
  ComponentAs,
  ComponentAlign,
  ComponentShape,
  ComponentSizeWithXxs,
  ComponentVariantWithDefault,
} from '../../types/shared/props'

export type ButtonVariant = ComponentVariantWithDefault | 'ghost' | 'simple' | 'link'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ButtonVariant
  size?: ComponentSizeWithXxs
  shape?: ComponentShape
  align?: ComponentAlign
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
