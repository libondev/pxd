import type { ComponentText, ComponentSizeWithXs } from '../../types/shared/props'

export interface ErrorType {
  link?: string
  label?: string
  action?: string
  message: string
}

export interface ErrorProps {
  size?: ComponentSizeWithXs
  label?: ComponentText
  error?: ErrorType
  variant?: 'default' | 'card'
}
