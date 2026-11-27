import type { ComponentText } from '../../types/shared/props'

export interface CollapseProps {
  heading?: ComponentText
  expand?: boolean
}

export interface CollapseEmits {
  toggle: [MouseEvent]
}
