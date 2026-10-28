import type { ComponentClass } from '../../types/shared/props'

export interface StickToBottomProps {
  enabled?: boolean
  threshold?: number
  contentClass?: ComponentClass
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean]
}
