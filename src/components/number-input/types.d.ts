import type { ChangeDetails } from '../../types/shared/change'

export interface NumberInputProps {
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  controls?: boolean
  precision?: number
  thousands?: boolean
  scientific?: boolean
  clearValue?: number | null
  modelValue?: number | null
  controlsPosition?: 'sides' | 'right'
  thousandsSeparator?: string
}

export interface NumberInputEmits {
  blur: [FocusEvent]
  focus: [FocusEvent]
  change: [NumberInputProps['modelValue'], details: ChangeDetails]
  'update:model-value': [NumberInputProps['modelValue']]
}

export interface NumberInputData {
  currentValue: number | null
  userInput: string | null
}
