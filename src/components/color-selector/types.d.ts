import type { ComponentSize } from '../../types/shared'

export interface ColorSelectorProps {
  size?: ComponentSize
  colors?: string[]
  modelValue?: string
}

export interface ColorSelectorEmits {
  change: [NonNullable<ColorSelectorProps['modelValue']>]
  'update:modelValue': [NonNullable<ColorSelectorProps['modelValue']>]
}
