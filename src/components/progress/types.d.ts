import type { ComponentSize, ComponentVariant } from '../../types/shared/props'

export interface ProgressProps {
  min?: number
  max?: number
  size?: ComponentSize
  label?: string | number
  showLabel?: boolean
  variant?: ComponentVariant | 'secondary'
  colors?: Record<string, string>
  modelValue?: number | null
}
