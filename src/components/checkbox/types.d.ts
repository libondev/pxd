import type { ComponentLabel, ComponentValue, ComponentShape } from '../../types/shared'

type CheckboxModelValue = ComponentValue | boolean

export interface CheckboxProps {
  label?: ComponentLabel
  value?: CheckboxModelValue
  shape?: ComponentShape
  disabled?: boolean
  modelValue?: CheckboxModelValue | CheckboxModelValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [NonNullable<CheckboxModelValue>]
  'update:modelValue': [NonNullable<CheckboxModelValue>]
}
