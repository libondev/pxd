import type {
  ComponentText,
  ComponentValue,
  ComponentOption,
  ResponsiveValue,
} from '../../types/shared/props'

export interface ChoiceboxProps {
  gap?: ResponsiveValue<number | string>
  label?: ComponentText
  multiple?: boolean
  disabled?: boolean
  options?: ComponentOption[]
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ChoiceboxEmits {
  change: [NonNullable<ChoiceboxProps['modelValue']>]
  'update:model-value': [NonNullable<ChoiceboxProps['modelValue']>]
}
