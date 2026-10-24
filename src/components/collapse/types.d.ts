import type { ComponentLabel } from '../../types/shared/props'

export interface CollapseProps {
  title?: ComponentLabel
  expand?: boolean
}

export interface CollapseEmits {
  toggle: [MouseEvent]
}
