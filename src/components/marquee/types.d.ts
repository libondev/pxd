import type { ComponentAs, ComponentText } from '../../types/shared/props'

export interface MarqueeProps {
  as?: ComponentAs
  text?: ComponentText
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
