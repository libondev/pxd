import type { ComponentPosition } from '../../types/shared'
import type { ListOption, ListOptionSelected } from '../list/types'

export interface MenuProps {
  options?: ListOption[]
  disabled?: boolean
  position?: ComponentPosition
  listWidth?: string | number
  modelValue?: ListOptionSelected['value']
  closeOnPressEscape?: boolean
}

export interface MenuEmits {
  change: [ListOptionSelected['value']]
  select: [ListOptionSelected, MouseEvent]
  'update:modelValue': [ListOptionSelected['value']]
}
