export type BorderBeamVariant = 'glow' | 'line' | 'bottom'

export interface BorderBeamProps {
  variant?: BorderBeamVariant
  color?: string | string[]
  strength?: number
  disabled?: boolean
}
