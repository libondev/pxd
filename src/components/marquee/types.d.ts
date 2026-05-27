import type { ComponentAs } from '../../types/shared'

export interface MarqueeProps {
  as?: ComponentAs
  text?: string
  color?: string
  background?: string
  delay?: number | string
  speed?: number | string
  scrollable?: boolean
  wrapable?: boolean
}

export interface MarqueeEmits {
  click: [MouseEvent]
  close: [MouseEvent]
  replay: []
}
