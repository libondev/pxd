import type { ButtonVariant } from '../../types/components/button'
import type {
  ComponentAs,
  ComponentAlign,
  ComponentShape,
  ComponentSizeWithXxs,
  ComponentText,
} from '../../types/shared/props'

export interface ButtonProps {
  as?: ComponentAs
  variant?: ButtonVariant
  text?: ComponentText
  size?: ComponentSizeWithXxs
  shape?: ComponentShape
  align?: ComponentAlign
  icon?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}
