import type { ComponentText, ComponentSizeWithXs } from '../../types/shared/props'

export interface ErrorInfoType {
  link?: string
  label?: string
  action?: string
  message: string
}

export interface ErrorInfoProps {
  size?: ComponentSizeWithXs
  label?: ComponentText
  error?: ErrorInfoType
  variant?: 'default' | 'card'
}
