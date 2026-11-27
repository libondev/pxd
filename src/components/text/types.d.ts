import type { ComponentAs, ComponentText, ResponsiveValue } from '../../types/shared/props'

export type TextVariant = 'default' | 'secondary'

export interface TextProps {
  as?: ComponentAs
  text?: ComponentText
  dimension?: ResponsiveValue<string | number>
  align?: 'left' | 'center' | 'right'
  monospace?: boolean
  variant?: TextVariant
}
