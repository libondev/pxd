import type { ComponentClass } from '../../types/shared/props'
import type { CSSProperties } from 'vue'

export interface StickToBottomProps {
  enabled?: boolean
  threshold?: number
  pauseOnInteract?: boolean
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean]
}
