import type { OverlayCloseReason } from '../../composables/_internal/use-dialog-layer'
import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type {
  ListFilterMethodFn,
  ListOptions,
  ListOptionSelected,
  ListRemoteFilterFn,
} from '../list/types'

export type CommandMenuCloseReason = Extract<ChangeReason, OverlayCloseReason | 'item-press'>

export type CommandMenuChangeReason = CommandMenuCloseReason | 'trigger-press' | 'api'

export interface CommandMenuProps {
  width?: string | number
  virtual?: boolean
  options?: ListOptions
  modelValue?: boolean
  placeholder?: string
  closeOnSelectItem?: boolean
  closeOnPressEscape?: boolean
  closeOnOutsideClick?: boolean
  filterMethod?: ListFilterMethodFn
  remoteFilter?: ListRemoteFilterFn
}

export interface CommandMenuEmits {
  'update:model-value': [boolean]
  change: [boolean, details: ChangeDetails<CommandMenuChangeReason>]
  select: [item: ListOptionSelected]
  close: [reason: CommandMenuCloseReason]
  show: []
  hide: []
}
