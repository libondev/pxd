import type { ComponentDirection, ComponentSize } from '../../types/shared'

export type StepsStatus = 'process' | 'finish' | 'error' | 'wait'

export interface StepsProps {
  modelValue?: number
  direction?: ComponentDirection
  status?: StepsStatus
  size?: ComponentSize
  clickable?: boolean
}

export interface StepsEmits {
  change: [number]
  'update:modelValue': [number]
}
