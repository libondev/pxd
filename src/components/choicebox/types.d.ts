import type {
  ComponentText,
  ComponentValue,
  ComponentOptionWithDescription,
  ResponsiveValue,
} from '../../types/shared/props'

export interface ChoiceboxProps {
  gap?: ResponsiveValue<number | string>
  label?: ComponentText
  multiple?: boolean
  disabled?: boolean
  options?: ComponentOptionWithDescription[]
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ChoiceboxEmits {
  change: [NonNullable<ChoiceboxProps['modelValue']>]
  'update:model-value': [NonNullable<ChoiceboxProps['modelValue']>]
}
