import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentValue } from '../../types/shared/props'

export interface RadioProps {
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  modelValue?: ComponentValue
}

export interface RadioEmits {
  change: [NonNullable<RadioProps['modelValue']>, details: ChangeDetails]
  'update:model-value': [NonNullable<RadioProps['modelValue']>]
}
