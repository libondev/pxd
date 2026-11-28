import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentPosition } from '../../types/shared/props'
import type { ListModelValue, ListOptions } from '../list/types'

export type MenuChangeReason = Extract<ChangeReason, 'item-press'>

export interface MenuProps {
  options?: ListOptions
  virtual?: boolean
  disabled?: boolean
  multiple?: boolean
  position?: ComponentPosition
  modelValue?: ListModelValue
}

export interface MenuEmits {
  change: [ListModelValue, details: ChangeDetails<MenuChangeReason>]
  'update:model-value': [ListModelValue]
}
