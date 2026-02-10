import type { ErrorType } from '../../types/components/error'
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'

export interface ErrorProps {
  size?: ComponentSizeWithXs
  label?: ComponentLabel
  error?: ErrorType
}
