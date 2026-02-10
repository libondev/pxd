import type { ComponentLabel, ResponsiveValue } from '../../types/shared'

export interface BookProps {
  color?: string
  title?: ComponentLabel
  width?: ResponsiveValue<string | number>
  variant?: 'simple' | 'stripe'
  textured?: boolean
}
