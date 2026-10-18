import type { ComponentSize } from '../../types/shared/props'

export interface ColorSelectorProps {
  size?: ComponentSize
  colors?: string[]
  modelValue?: string
}

export interface ColorSelectorEmits {
  change: [NonNullable<ColorSelectorProps['modelValue']>]
  'update:modelValue': [NonNullable<ColorSelectorProps['modelValue']>]
}
