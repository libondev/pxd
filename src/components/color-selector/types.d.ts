import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentSize } from '../../types/shared/props'

export interface ColorSelectorProps {
  size?: ComponentSize
  colors?: string[]
  modelValue?: string
}

export interface ColorSelectorEmits {
  change: [NonNullable<ColorSelectorProps['modelValue']>, details: ChangeDetails]
  'update:model-value': [NonNullable<ColorSelectorProps['modelValue']>]
}
