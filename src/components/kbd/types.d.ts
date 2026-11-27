import type { ComponentSize, ComponentText } from '../../types/shared/props'

export interface KbdProps {
  optionKey?: boolean
  ctrl?: boolean
  meta?: boolean
  enter?: boolean
  shift?: boolean
  label?: ComponentText
  size?: ComponentSize
}
