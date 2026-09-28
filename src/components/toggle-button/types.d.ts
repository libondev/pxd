import type { ComponentLabel, ComponentSize, ComponentValue } from '../../types/shared'
import type { CheckboxProps } from '../checkbox/types'

type ToggleButtonModelValue = ComponentValue | boolean

export interface ToggleButtonProps {
  size?: ComponentSize
  label?: ComponentLabel
  value?: ToggleButtonModelValue
  variant?: 'ghost' | 'outline'
  disabled?: boolean
  modelValue?: ToggleButtonModelValue | ToggleButtonModelValue[]
}

export interface ToggleButtonEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
