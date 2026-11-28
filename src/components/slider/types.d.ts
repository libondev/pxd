import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentSize, ComponentVariant } from '../../types/shared/props'

export type SliderChangeReason = Extract<ChangeReason, 'api' | 'item-press' | 'settle'>

export interface SliderProps {
  min?: number
  max?: number
  step?: number | number[]
  range?: boolean
  stops?: boolean
  marks?: Record<number, string>
  disabled?: boolean
  id?: string
  invalid?: boolean
  size?: ComponentSize
  variant?: ComponentVariant | 'secondary'
  modelValue?: number | number[] | null
  defaultValue?: number | number[] | null
}

export type SliderChangeValue = number | number[]

export interface SliderEmits {
  change: [SliderChangeValue, details: ChangeDetails<SliderChangeReason>]
  'update:model-value': [SliderChangeValue]
}
