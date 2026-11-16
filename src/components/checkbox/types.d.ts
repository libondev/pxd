import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentValue, ComponentShape } from '../../types/shared/props'

type CheckboxModelValue = ComponentValue | boolean

export interface CheckboxProps {
  label?: ComponentText
  value?: CheckboxModelValue
  shape?: ComponentShape
  disabled?: boolean
  modelValue?: CheckboxModelValue | CheckboxModelValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [NonNullable<CheckboxModelValue>, details?: ChangeDetails]
  'update:model-value': [NonNullable<CheckboxModelValue>]
}
