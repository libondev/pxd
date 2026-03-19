import type { ComponentSizeWithXs, ComponentAlign } from '../../types/shared'
import type { ButtonVariant } from '../button/types'

export interface ButtonGroupProps {
  size?: ComponentSizeWithXs
  align?: ComponentAlign
  variant?: ButtonVariant
  disabled?: boolean
}
