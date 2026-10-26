import type { ComponentText } from '../../types/shared/props'

export interface CollapseProps {
  title?: ComponentText
  expand?: boolean
}

export interface CollapseEmits {
  toggle: [MouseEvent]
}
