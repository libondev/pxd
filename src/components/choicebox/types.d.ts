import type { ComponentLabel, ComponentOption, ComponentValue } from '../../types/shared'

interface Option extends ComponentOption {
  description?: string
}

export interface ChoiceboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  description?: string
}
