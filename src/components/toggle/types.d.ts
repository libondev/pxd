import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentBeforeChange, ComponentSize } from '../../types/shared/props'

export type ToggleChangeReason = Extract<ChangeReason, 'api' | 'trigger-press'>

export type ToggleValueType = boolean | number | string | undefined

export interface ToggleProps {
  size?: ComponentSize
  loading?: boolean
  disabled?: boolean
  modelValue?: ToggleValueType
  activeValue?: ToggleValueType
  inactiveValue?: ToggleValueType
  beforeChange?: ComponentBeforeChange<ToggleValueType>
  activeColor?: string
  inactiveColor?: string
  activeLabel?: string
  inactiveLabel?: string
}

export type ToggleChangeValue = boolean | number | string

export interface ToggleEmits {
  change: [ToggleChangeValue, details: ChangeDetails<ToggleChangeReason>]
  'update:model-value': [ToggleChangeValue]
}
