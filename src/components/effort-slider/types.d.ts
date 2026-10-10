import type { ComponentSize, ComponentOption } from '../../types/shared'

export interface EffortSliderProps {
  options: Array<ComponentOption | string>
  colors?: Record<string, string>
  disabled?: boolean
  size?: ComponentSize
  modelValue?: string | number | null
}

export interface EffortSliderEmits {
  change: [string | number]
  'update:modelValue': [string | number]
}
