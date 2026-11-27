import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentClass, ComponentDirection } from '../../types/shared/props'

export interface StickToBottomProps {
  disabled?: boolean
  threshold?: number
  fader?: boolean
  faderColor?: string
  faderDimension?: number
  faderDirection?: ComponentDirection | 'both'
  contentClass?: ComponentClass
  wrapperClass?: ComponentClass
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean, details: ChangeDetails]
}
