import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type {
  ComponentText,
  ComponentValue,
  ComponentOptionWithDescription,
  ResponsiveValue,
} from '../../types/shared/props'

export type ChoiceboxChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface ChoiceboxProps {
  gap?: ResponsiveValue<number | string>
  label?: ComponentText
  multiple?: boolean
  disabled?: boolean
  options?: ComponentOptionWithDescription[]
  modelValue?: ComponentValue | ComponentValue[]
}

export type ChoiceboxChangeValue = ComponentValue | ComponentValue[]

export interface ChoiceboxEmits {
  change: [ChoiceboxChangeValue, details: ChangeDetails<ChoiceboxChangeReason>]
  'update:model-value': [ChoiceboxChangeValue]
}
