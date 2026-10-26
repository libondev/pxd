import type { ComponentText, ComponentSize } from '../../types/shared/props'

export type NoteVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'default'
  | 'primary'
  | 'violet'
  | 'cyan'
  | 'ghost'

export interface NoteProps {
  variant?: NoteVariant
  size?: ComponentSize
  fill?: boolean
  text?: ComponentText
  label?: boolean | ComponentText
}
