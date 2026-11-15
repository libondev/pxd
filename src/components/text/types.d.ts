import type { ComponentAs, ComponentText, ResponsiveValue } from '../../types/shared/props'

export interface TextProps {
  as?: ComponentAs
  text?: ComponentText
  size?: ResponsiveValue<string | number>
  align?: 'left' | 'center' | 'right'
  monospace?: boolean
  secondary?: boolean
}
