import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'

export interface ErrorType {
  link?: string
  action?: string
}

export interface ErrorProps {
  size?: ComponentSizeWithXs
  label?: ComponentLabel
  error?: ErrorType
}
