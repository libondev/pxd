import type { ComponentSize } from '../../types/shared'

export interface CollapseProps {
  title?: string
  expand?: boolean
}

export interface CollapseGroupProps {
  multiple?: boolean
  size?: ComponentSize
}
