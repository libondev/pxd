import type { ComponentText, ResponsiveValue } from '../../types/shared/props'

export interface BookProps {
  color?: string
  title?: ComponentText
  width?: ResponsiveValue<string | number>
  variant?: 'simple' | 'stripe'
  textured?: boolean
}
