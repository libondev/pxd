import type { ComponentPosition } from '../../types/shared'
import type { ListModelValue, ListOptions, ListValue } from '../list/types'

export interface MenuProps {
  options?: ListOptions
  disabled?: boolean
  multiple?: boolean
  position?: ComponentPosition
  modelValue?: ListModelValue
  closeOnPressEscape?: boolean
}

export interface MenuEmits {
  change: [ListModelValue]
  'update:modelValue': [ListModelValue]
}
