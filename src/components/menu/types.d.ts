import type { ComponentPosition } from '../../types/shared'
import type { ListOptions, ListOptionSelected } from '../list/types'

export interface MenuProps {
  options?: ListOptions
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
