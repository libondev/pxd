import type { ButtonVariant } from '../../types/components/button'
import type { ComponentSizeWithXxs, ComponentAlign } from '../../types/shared/props'

export interface ButtonGroupProps {
  size?: ComponentSizeWithXxs
  align?: ComponentAlign
  variant?: ButtonVariant
  disabled?: boolean
}
