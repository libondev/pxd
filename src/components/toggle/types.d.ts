import type { ComponentBeforeChange, ComponentSize } from '../../types/shared'

export type ValueType = boolean | number | string | undefined

export interface ToggleProps {
  size?: ComponentSize
  loading?: boolean
  disabled?: boolean
  modelValue?: ValueType
  activeValue?: ValueType
  inactiveValue?: ValueType
  beforeChange?: ComponentBeforeChange<ValueType>
  activeColor?: string
  inactiveColor?: string
  activeLabel?: string
  inactiveLabel?: string
}

export interface ToggleEmits {
  change: [NonNullable<ToggleProps['modelValue']>]
  'update:modelValue': [NonNullable<ToggleProps['modelValue']>]
}
