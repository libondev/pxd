import type { ButtonVariant } from '../../types/shared/button'
import type { ComponentSizeWithXxs, ComponentAlign } from '../../types/shared/props'

export interface ButtonGroupProps {
  size?: ComponentSizeWithXxs
  align?: ComponentAlign
  variant?: ButtonVariant
  disabled?: boolean
}
