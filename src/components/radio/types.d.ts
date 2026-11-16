import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentValue } from '../../types/shared/props'

export interface RadioProps {
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  modelValue?: ComponentValue
}

export type RadioChangeValue = ComponentValue

export interface RadioEmits {
  change: [RadioChangeValue, details: ChangeDetails]
  'update:model-value': [RadioChangeValue]
}
