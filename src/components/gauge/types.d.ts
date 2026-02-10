import type { ComponentSizeWithXs } from '../../types/shared'

export interface GaugeProps {
  modelValue?: number | null
  showValue?: boolean
  indeterminate?: boolean
  size?: ComponentSizeWithXs
  colors?: Record<string, string>
}
