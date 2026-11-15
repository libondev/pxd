import type { ComponentText } from '../../types/shared/props'

export interface SwitchItemProps {
  label?: ComponentText
  value: string | number
  disabled?: boolean
  modelValue?: string | number
}

export interface SwitchItemEmits {
  change: [NonNullable<SwitchItemProps['modelValue']>]
  'update:model-value': [NonNullable<SwitchItemProps['modelValue']>]
}
