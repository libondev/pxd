import type { ListOptions, ListOptionSelected } from '../list/types'

export interface CommandMenuProps {
  width?: string | number
  modelValue?: boolean
  options?: ListOptions
  placeholder?: string
  closeOnSelectItem?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface CommandMenuEmits {
  'update:modelValue': [boolean]
  change: [boolean]
  show: []
  hide: []
}
