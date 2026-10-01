import type { ComponentDirection, ComponentLabel, ComponentSize } from '../../types/shared'

export type StepsStatus = 'process' | 'finish' | 'error' | 'wait'

export interface StepsOption {
  title?: ComponentLabel
  description?: ComponentLabel
  status?: StepsStatus
  disabled?: boolean
}

export interface StepsProps {
  modelValue?: number
  defaultValue?: number
  direction?: ComponentDirection
  status?: StepsStatus
  size?: ComponentSize
  clickable?: boolean
  options: StepsOption[]
}

export interface StepsEmits {
  change: [number]
  'update:modelValue': [number]
}
