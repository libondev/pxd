import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentText, ComponentValue } from '../../types/shared/props'

export type RadioChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface RadioProps {
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  modelValue?: ComponentValue
}

export type RadioChangeValue = ComponentValue

export interface RadioEmits {
  change: [RadioChangeValue, details: ChangeDetails<RadioChangeReason>]
  'update:model-value': [RadioChangeValue]
}
