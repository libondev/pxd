import type { ComponentSize, ComponentVariant } from '../../types/shared/props'

export interface ProgressProps {
  min?: number
  max?: number
  size?: ComponentSize
  label?: boolean | string | number
  variant?: ComponentVariant | 'secondary'
  colors?: Record<string, string>
  modelValue?: number | null
}
