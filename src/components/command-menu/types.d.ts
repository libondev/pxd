import type { ListOptionSelected } from '../list/types'

export interface CommandMenuProps {
  width?: string | number
  modelValue?: boolean
  placeholder?: string
  closeOnSelectItem?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface CommandMenuEmits {
  'update:modelValue': [boolean]
  select: [ListOptionSelected, MouseEvent]
  change: [boolean]
  show: []
  hide: []
}
