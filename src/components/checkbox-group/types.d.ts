import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export type CheckboxGroupChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

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
  change: [CheckboxGroupChangeValue, details: ChangeDetails<CheckboxGroupChangeReason>]
  'update:model-value': [CheckboxGroupChangeValue]
}
