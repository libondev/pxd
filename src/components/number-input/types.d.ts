export interface NumberInputProps {
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  precision?: number
  scientific?: boolean
  clearValue?: number | null
  modelValue?: number | null
}

export interface NumberInputEmits {
  focus: [FocusEvent]
  blur: [FocusEvent]
  input: [NumberInputProps['modelValue']]
  change: [NumberInputProps['modelValue'], Event]
  'update:modelValue': [NumberInputProps['modelValue']]
}

export interface NumberInputData {
  currentValue: NumberInputProps['modelValue']
  userInput: string | null
}
