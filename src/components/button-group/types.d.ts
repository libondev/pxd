import type { ComponentSizeWithXs, ComponentAlign } from '../../types/shared/props'
import type { ButtonVariant } from '../button/types'

export interface ButtonGroupProps {
  size?: ComponentSizeWithXs | 'xxs'
  align?: ComponentAlign
  variant?: ButtonVariant
  disabled?: boolean
}
