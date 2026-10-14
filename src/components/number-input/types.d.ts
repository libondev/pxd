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
  change: [NumberInputProps['modelValue'], Event]
  'update:modelValue': [NumberInputProps['modelValue']]
}

export interface NumberInputData {
  currentValue: NumberInputProps['modelValue']
  userInput: string | null
}
