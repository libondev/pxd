import type { ComponentDirection, ComponentText, ComponentSize } from '../../types/shared/props'

export type StepsStatus = 'process' | 'finish' | 'error' | 'wait'

export interface StepsOption {
  title?: ComponentText
  description?: ComponentText
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
  'update:model-value': [number]
}
