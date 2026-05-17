import type { ComponentLabel, ComponentValue } from '../../types/shared'

export interface ChoiceboxItemProps {
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
  description?: string
}
