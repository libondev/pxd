import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentDirection, ComponentText, ComponentSize } from '../../types/shared/props'

export type StepsChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export type StepsStatus = 'process' | 'finish' | 'error' | 'wait'

export interface StepsOption {
  heading?: ComponentText
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
  change: [number, details: ChangeDetails<StepsChangeReason>]
  'update:model-value': [number]
}
