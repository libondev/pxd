import type { ComponentPosition } from '../../types/shared'
import type { ListOption, ListOptionSelected } from '../list/types'

export interface MenuProps {
  width?: string | number
  options?: ListOption[]
  position?: ComponentPosition
  closeOnPressEscape?: boolean
}

export interface MenuEmits {
  change: [visible: boolean]
  select: [ListOptionSelected, MouseEvent]
}
