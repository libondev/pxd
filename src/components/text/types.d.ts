import type { ComponentAs, ResponsiveValue } from '../../types/shared'

export interface TextProps {
  as?: ComponentAs
  text?: string
  size?: ResponsiveValue<string | number>
  align?: 'left' | 'center' | 'right'
  monospace?: boolean
  secondary?: boolean
}
