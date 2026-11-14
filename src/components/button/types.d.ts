import type { ButtonVariant } from '../../types/shared/button'
import type {
  ComponentAs,
  ComponentAlign,
  ComponentShape,
  ComponentSizeWithXxs,
} from '../../types/shared/props'

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
