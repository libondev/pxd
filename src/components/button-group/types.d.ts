import type { ComponentSizeWithXxs, ComponentAlign } from '../../types/shared/props'
import type { ButtonVariant } from '../button/types'

export interface ButtonGroupProps {
  size?: ComponentSizeWithXxs
  align?: ComponentAlign
  variant?: ButtonVariant
  disabled?: boolean
}
