import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

type CheckboxGroupModelValue = ComponentValue | boolean

export interface CheckboxGroupProps {
  disabled?: boolean
  id?: string
  invalid?: boolean
  options?: ComponentOption[]
  modelValue?: CheckboxGroupModelValue[]
}

export type CheckboxGroupChangeValue = CheckboxGroupModelValue[]

export interface CheckboxGroupEmits {
  change: [CheckboxGroupChangeValue, details: ChangeDetails]
  'update:model-value': [CheckboxGroupChangeValue]
}
