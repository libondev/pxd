import type { ComponentSize, ComponentVariant } from '../../types/shared'

export interface ProgressProps {
  min?: number
  max?: number
  size?: ComponentSize
  label?: boolean | string | number
  variant?: ComponentVariant | 'secondary'
  colors?: Record<string, string>
  modelValue?: number | null
}

export interface ProgressEmits {
  change: [NonNullable<ProgressProps['modelValue']>]
  'update:modelValue': [NonNullable<ProgressProps['modelValue']>]
}
