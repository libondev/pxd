import type { ComponentSize, ComponentOption } from '../../types/shared/props'

export interface EffortSliderProps {
  options: Array<ComponentOption | string>
  colors?: Record<string, string>
  disabled?: boolean
  particles?: boolean
  size?: ComponentSize
  modelValue?: string | number | null
  defaultValue?: string | number | null
}

export interface EffortSliderEmits {
  change: [string | number]
  'update:model-value': [string | number]
}
