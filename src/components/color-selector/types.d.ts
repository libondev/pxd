import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentSize } from '../../types/shared/props'

export interface ColorSelectorProps {
  size?: ComponentSize
  colors?: string[]
  modelValue?: string
}

export type ColorSelectorChangeValue = string

export interface ColorSelectorEmits {
  change: [ColorSelectorChangeValue, details: ChangeDetails]
  'update:model-value': [ColorSelectorChangeValue]
}
