import type { ComponentClass } from '../../types/shared/props'

export interface StickToBottomProps {
  disabled?: boolean
  threshold?: number
  contentClass?: ComponentClass
  wrapperClass?: ComponentClass
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean]
}
