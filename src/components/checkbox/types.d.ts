import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentText, ComponentValue, ComponentShape } from '../../types/shared/props'

export type CheckboxChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export type CheckboxModelValue = ComponentValue | boolean

export interface CheckboxProps {
  label?: ComponentText
  value?: CheckboxModelValue
  shape?: ComponentShape
  disabled?: boolean
  modelValue?: CheckboxModelValue | CheckboxModelValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [CheckboxModelValue, details: ChangeDetails<CheckboxChangeReason>]
  'update:model-value': [CheckboxModelValue]
}
