import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentSize } from '../../types/shared/props'

export type ColorSelectorChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface ColorSelectorProps {
  size?: ComponentSize
  colors?: string[]
  modelValue?: string
}

export type ColorSelectorChangeValue = string

export interface ColorSelectorEmits {
  change: [ColorSelectorChangeValue, details: ChangeDetails<ColorSelectorChangeReason>]
  'update:model-value': [ColorSelectorChangeValue]
}
