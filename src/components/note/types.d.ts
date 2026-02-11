import type { ComponentLabel, ComponentSize } from '../../types/shared'

export type NoteVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'default'
  | 'primary'
  | 'violet'
  | 'cyan'

export interface NoteProps {
  variant?: NoteVariant
  size?: ComponentSize
  fill?: boolean
  label?: boolean | ComponentLabel
}
