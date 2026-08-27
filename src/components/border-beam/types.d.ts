export type BorderBeamVariant = 'glow' | 'line'

export interface BorderBeamProps {
  variant?: BorderBeamVariant
  color?: string | string[]
  strength?: number
  disabled?: boolean
}
