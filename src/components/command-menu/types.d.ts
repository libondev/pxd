import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type {
  ListFilterMethodFn,
  ListOptions,
  ListOptionSelected,
  ListRemoteFilterFn,
} from '../list/types'

export interface CommandMenuProps {
  width?: string | number
  virtual?: boolean
  options?: ListOptions
  modelValue?: boolean
  placeholder?: string
  closeOnSelectItem?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  filterMethod?: ListFilterMethodFn
  remoteFilter?: ListRemoteFilterFn
}

export interface CommandMenuEmits {
  'update:model-value': [boolean]
  change: [boolean, details: ChangeDetails]
  close: [reason: ChangeReason]
  show: []
  hide: []
}
