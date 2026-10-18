import type { ComponentClass, ComponentPosition } from '../../types/shared/props'

export type HintStatus = 'idle' | 'pending' | 'success' | 'error'

export interface HintProps {
  content?: string
  promise?: Promise<unknown>
  position?: ComponentPosition
  duration?: number
  closeable?: boolean
  pauseOnHover?: boolean
  contentClass?: ComponentClass
}

export interface HintEmits {
  close: []
}
