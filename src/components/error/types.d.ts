import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'

export interface ErrorType {
  link?: string
  label?: string
  action?: string
  message: string
}

export interface ErrorProps {
  size?: ComponentSizeWithXs
  label?: ComponentLabel
  error?: ErrorType
  variant?: 'default' | 'card'
}
