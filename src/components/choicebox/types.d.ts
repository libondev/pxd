import type {
  ComponentLabel,
  ComponentValue,
  ComponentOption,
  ResponsiveValue,
} from '../../types/shared/props'

export interface ChoiceboxProps {
  gap?: ResponsiveValue<number | string>
  label?: ComponentLabel
  multiple?: boolean
  disabled?: boolean
  options?: ComponentOption[]
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ChoiceboxEmits {
  change: [NonNullable<ChoiceboxProps['modelValue']>]
  'update:model-value': [NonNullable<ChoiceboxProps['modelValue']>]
}
