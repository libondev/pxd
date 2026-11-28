import type { ChangeDetails, ChangeReason } from '../../types/shared/change'

export type NumberInputChangeReason = Extract<ChangeReason, 'api' | 'cleared' | 'typed'>

export interface NumberInputProps {
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
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
  change: [NumberInputProps['modelValue'], details: ChangeDetails<NumberInputChangeReason>]
  'update:model-value': [NumberInputProps['modelValue']]
}

export interface NumberInputData {
  currentValue: number | null
  userInput: string | null
}
