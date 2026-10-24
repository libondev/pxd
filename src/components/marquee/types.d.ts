import type { ComponentAs, ComponentLabel } from '../../types/shared/props'

export interface MarqueeProps {
  as?: ComponentAs
  text?: ComponentLabel
  color?: string
  background?: string
  delay?: number | string
  speed?: number | string
  scrollable?: boolean
  wrapable?: boolean
  pauseOnHover?: boolean
}

export interface MarqueeEmits {
  click: [MouseEvent]
  replay: []
}
