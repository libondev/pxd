import type { ComponentPosition } from '../../types/shared'
import type { ListOptions, ListOptionSelected } from '../list/types'

export interface MenuProps {
  options?: ListOptions
  disabled?: boolean
  position?: ComponentPosition
  modelValue?: ListOptionSelected['value']
  closeOnPressEscape?: boolean
}

export interface MenuEmits {
  change: [ListOptionSelected['value']]
  'update:modelValue': [ListOptionSelected['value']]
}
