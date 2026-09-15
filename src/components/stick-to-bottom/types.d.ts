import type { ComponentClass } from '../../types/shared'
import type { CSSProperties } from 'vue'

export interface StickToBottomProps {
  enabled?: boolean
  threshold?: number
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean]
}
